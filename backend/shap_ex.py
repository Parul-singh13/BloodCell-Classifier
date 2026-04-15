import shap
import numpy as np
import matplotlib.pyplot as plt
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
from tensorflow.keras.applications.imagenet_utils import preprocess_input
import os
import base64
from io import BytesIO

# ------------------------------------
# Class labels (update this list based on your model)
# ------------------------------------
class_labels = ['basophil', 'eosinophil', 'lymphocyte', 'monocyte', 'neutrophil']

# ------------------------------------
# Load and preprocess image
# ------------------------------------
def load_and_preprocess_image(img_path, target_size=(224, 224)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    return img_array

# ------------------------------------
# Predict class
# ------------------------------------
def predict_class(model, img_array):
    img_batch = np.expand_dims(preprocess_input(img_array.copy()), axis=0)
    preds = model.predict(img_batch)

    predicted_class_index = np.argmax(preds)
    predicted_class = class_labels[predicted_class_index]
    confidence = preds[0][predicted_class_index]

    return predicted_class, confidence, predicted_class_index, preds[0]

# ------------------------------------
# SHAP explanation with ImageMasker
# ------------------------------------
def generate_shap_explanation(model, img_array, predicted_class_index, output_path=None):
    def model_predict(images):
        images = np.array([preprocess_input(img.copy()) for img in images])
        return model.predict(images)

    masker = shap.maskers.Image("inpaint_telea", img_array.shape)
    explainer = shap.Explainer(model_predict, masker, output_names=class_labels)
    img_batch = np.stack([img_array])

    shap_values = explainer(
        img_batch,
        max_evals=150,  # Optimized for response time
        batch_size=50,
        outputs=[predicted_class_index]
    )
    
    shap_values_array = shap_values.values[0]

    # Normalize SHAP values
    shap_max = np.max(shap_values_array)
    if shap_max > 0:
        shap_values_array = np.clip(shap_values_array, 0, shap_max)
        shap_values_array /= shap_max

    plt.figure(figsize=(12, 8))
    shap.image_plot(
        shap_values_array,
        img_batch,
        show=False
    )

    if output_path:
        plt.savefig(output_path, format='png', bbox_inches='tight')
    
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close()
    
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    return img_str

# ------------------------------------
# Main function to run SHAP explanation
# ------------------------------------
def run_shap(model, img_path, output_path=None):
    try:
        if not os.path.exists(img_path):
            return {"error": f"Image not found at: {img_path}"}
        
        img_array = load_and_preprocess_image(img_path)
        predicted_class, confidence, predicted_class_index, all_probs = predict_class(model, img_array)
        
        explanation_image = generate_shap_explanation(
            model, img_array, predicted_class_index, output_path
        )
        
        explanation = (f"The model identified this as **{predicted_class.capitalize()}** with **{confidence:.1%}** confidence. "
                       f"The SHAP visualization highlights the areas (in red) that most strongly influenced the AI's decision.")
        
        return {
            "success": True,
            "predicted_class": predicted_class,
            "confidence": float(confidence),
            "explanation": explanation,
            "explanation_image": explanation_image
        }
        
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}
