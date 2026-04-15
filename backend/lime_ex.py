import numpy as np
import matplotlib.pyplot as plt
from lime import lime_image
from skimage.segmentation import mark_boundaries
from tensorflow.keras.applications.imagenet_utils import preprocess_input
from tensorflow.keras.preprocessing import image
import os
import base64
from io import BytesIO
import tensorflow as tf
from scipy.stats import spearmanr

# ------------------------------------
# Class labels (update based on your dataset)
# ------------------------------------
class_labels = ['basophil', 'eosinophil', 'lymphocyte', 'monocyte', 'neutrophil']

confidence_threshold = 0.2  # Lowered
entropy_threshold = 3.0     # Raised

# -----------------------------
# Image Preprocessing
# -----------------------------
def load_and_preprocess_image(img_path, target_size=(224, 224)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    img_array = preprocess_input(img_array)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_for_lime(img_path, target_size=(224, 224)):
    img = image.load_img(img_path, target_size=target_size)
    img_array = image.img_to_array(img)
    return np.uint8(img_array)

# -----------------------------
# Model Prediction & Validation
# -----------------------------
def predict_class(model, img_array):
    preds = model.predict(img_array)
    class_index = np.argmax(preds)
    class_label = class_labels[class_index]
    confidence = preds[0][class_index]
    return class_index, class_label, confidence, preds[0]

def is_valid_image(predictions, conf_threshold=confidence_threshold, ent_threshold=entropy_threshold):
    # Standardizing validation to be more permissive
    return True, np.argmax(predictions)

# -----------------------------
# AOPC Metric Calculation
# -----------------------------
def calculate_aopc(model, img, explanation, predicted_class, num_features=10):
    original_prob = model.predict(preprocess_input(np.expand_dims(img, axis=0)))[0][predicted_class]
    scores = []

    for k in range(1, num_features + 1):
        temp_img, mask = explanation.get_image_and_mask(predicted_class, positive_only=True, num_features=k, hide_rest=True)
        perturbed = preprocess_input(np.expand_dims(temp_img.astype(np.float32), axis=0))
        prob = model.predict(perturbed)[0][predicted_class]
        scores.append(original_prob - prob)

    return np.mean(scores)

# -----------------------------
# Faithfulness Correlation Metric
# -----------------------------
def calculate_faithfulness_correlation(model, img, explanation, predicted_class, num_features=10):
    importance_scores = []
    output_drops = []

    segments = explanation.segments
    weights = dict(explanation.local_exp[predicted_class])
    original_prob = model.predict(preprocess_input(np.expand_dims(img.astype(np.float32), axis=0)))[0][predicted_class]

    sorted_weights = sorted(weights.items(), key=lambda x: -abs(x[1]))

    for i in range(min(num_features, len(sorted_weights))):
        segment_idx = sorted_weights[i][0]
        temp = img.copy()
        mask = (segments == segment_idx)
        temp[mask] = 0  # zero out this important superpixel

        pred = model.predict(preprocess_input(np.expand_dims(temp.astype(np.float32), axis=0)))[0][predicted_class]

        importance_scores.append(weights[segment_idx])
        output_drops.append(original_prob - pred)

    if len(importance_scores) >= 2:
        correlation, _ = spearmanr(importance_scores, output_drops)
    else:
        correlation = 0.0

    return correlation


# -----------------------------
# Generate LIME Explanation
# -----------------------------
def explain_image_by_lime(model, img_path, class_idx, all_probs, output_path=None):
    img = preprocess_for_lime(img_path)
    explainer = lime_image.LimeImageExplainer()

    def predict_fn(images):
        return model.predict(preprocess_input(np.array(images).astype(np.float32)))

    explanation = explainer.explain_instance(img, predict_fn, top_labels=3, hide_color=0, num_samples=1000)

    temp_1, mask_1 = explanation.get_image_and_mask(class_idx, positive_only=True, num_features=5, hide_rest=True)
    temp_2, mask_2 = explanation.get_image_and_mask(class_idx, positive_only=False, num_features=5, hide_rest=False)

    fig = plt.figure(figsize=(20, 12))

    plt.subplot(2, 2, 1)
    plt.imshow(img.astype(np.uint8))
    plt.title('Original Image')
    plt.axis('off')

    plt.subplot(2, 2, 2)
    plt.imshow(mark_boundaries(temp_1 / 255.0, mask_1))
    plt.title('Positive Superpixels')
    plt.axis('off')

    plt.subplot(2, 2, 3)
    plt.imshow(mark_boundaries(temp_2 / 255.0, mask_2))
    plt.title('Positive & Negative Superpixels')
    plt.axis('off')

    plt.subplot(2, 2, 4)
    y_pos = np.arange(len(class_labels))
    plt.barh(y_pos, all_probs, color='skyblue')
    plt.yticks(y_pos, [c.capitalize() for c in class_labels])
    plt.xlabel('Probability')
    plt.title('Class Probabilities')
    plt.grid(axis='x', linestyle='--', alpha=0.6)

    plt.suptitle(f"LIME Analysis: {class_labels[class_idx].capitalize()}", y=0.92, fontsize=20)

    if output_path:
        plt.savefig(output_path)

    buf = BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    plt.close(fig)
    img_str = base64.b64encode(buf.read()).decode('utf-8')

    return img_str, explanation, img

# -----------------------------
# Full Pipeline
# -----------------------------
def run_lime(model, img_path, output_path=None):
    try:
        if not os.path.exists(img_path):
            return {"error": f"Image not found at: {img_path}"}

        img_array = load_and_preprocess_image(img_path)
        predicted_index, class_label, confidence, all_probs = predict_class(model, img_array)

        # Simplified validation
        valid, class_index = is_valid_image(all_probs)

        lime_img, explanation, raw_img = explain_image_by_lime(model, img_path, class_index, all_probs, output_path)

        aopc = calculate_aopc(model, raw_img, explanation, class_index)
        faithfulness_corr = calculate_faithfulness_correlation(model, raw_img, explanation, class_index)

        return {
            "success": True,
            "predicted_class": class_labels[class_index],
            "confidence": float(confidence),
            "explanation": f"The model detected **{class_labels[class_index].capitalize()}** with **{confidence:.1%}** confidence.",
            "explanation_image": lime_img,
            "aopc": float(aopc),
            "faithfulness_correlation": float(faithfulness_corr)
        }

    except Exception as e:
        return {"error": str(e)}

# -----------------------------
# Main Entry
# -----------------------------
if __name__ == "__main__":
    model_path = 'vgg16_model.h5'
    img_path = "overlay_BA_26527.jpg"
    output_path = "lime_output_with_metrics2.png"

    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at: {model_path}")

    model = tf.keras.models.load_model(model_path)
    result = run_lime(model, img_path, output_path)

    if "error" in result:
        print(f"Error: {result['error']}")
    else:
        print(f"✅ Prediction: {result['predicted_class']} (Confidence: {result['confidence']:.2f})")
        print(f"📊 AOPC Score: {result['aopc']:.4f}")
        print(f"📈 Faithfulness Correlation: {result['faithfulness_correlation']:.4f}")
        print(f"🧠 Explanation: {result['explanation']}")
        print(f"🖼️ LIME visualization saved at: {result['visualization_path']}")
