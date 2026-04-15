import numpy as np
import tensorflow as tf
import matplotlib.pyplot as plt
import cv2
import os
import base64
from io import BytesIO

class_labels = ['basophil', 'eosinophil', 'lymphocyte', 'monocyte', 'neutrophil']

def get_img_array(img_path, size):
    img = tf.keras.preprocessing.image.load_img(img_path, target_size=size)
    array = tf.keras.preprocessing.image.img_to_array(img)
    array = np.expand_dims(array, axis=0)
    return array / 255.0  # Normalize

def make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index=None):
    grad_model = tf.keras.models.Model(
        [model.inputs], [model.get_layer(last_conv_layer_name).output, model.output]
    )

    with tf.GradientTape() as tape:
        conv_outputs, predictions = grad_model(img_array)
        if pred_index is None:
            pred_index = tf.argmax(predictions[0])
        class_channel = predictions[:, pred_index]

    grads = tape.gradient(class_channel, conv_outputs)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    conv_outputs = conv_outputs[0]
    heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
    return heatmap.numpy()

def generate_gradcam_visual(img_path, heatmap, alpha=0.4):
    img = cv2.imread(img_path)
    img = cv2.resize(img, (224, 224))

    heatmap = cv2.resize(heatmap, (img.shape[1], img.shape[0]))
    heatmap = np.uint8(255 * heatmap)

    heatmap_color = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    superimposed = cv2.addWeighted(img, 1 - alpha, heatmap_color, alpha, 0)

    fig = plt.figure(figsize=(10, 10))
    plt.imshow(cv2.cvtColor(superimposed, cv2.COLOR_BGR2RGB))
    plt.axis('off')
    plt.title("Grad-CAM Heatmap", fontsize=16)
    
    buf = BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight')
    buf.seek(0)
    plt.close(fig)
    
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    return img_str

def run_gradcam(model, img_path):
    try:
        if not os.path.exists(img_path):
            return {"error": f"Image not found at: {img_path}"}

        img_array = get_img_array(img_path, size=(224, 224))
        
        # Determine last conv layer based on model architecture
        layer_names = [l.name for l in model.layers]
        if "conv5_block3_out" in layer_names:
            last_conv_layer_name = "conv5_block3_out"
        elif "block5_conv3" in layer_names:
            last_conv_layer_name = "block5_conv3"
        else:
            # Fallback to the last layer with 'conv' in name
            conv_layers = [l.name for l in model.layers if "conv" in l.name]
            last_conv_layer_name = conv_layers[-1] if conv_layers else None

        if not last_conv_layer_name:
            return {"error": "Could not identify a convolutional layer for Grad-CAM."}

        # Predict
        preds = model.predict(img_array)
        pred_index = np.argmax(preds[0])
        confidence = preds[0][pred_index]
        predicted_class = class_labels[pred_index]

        # Generate heatmap
        heatmap = make_gradcam_heatmap(img_array, model, last_conv_layer_name, pred_index)
        
        # Generate visual
        grad_img = generate_gradcam_visual(img_path, heatmap)

        return {
            "success": True,
            "predicted_class": predicted_class,
            "confidence": float(confidence),
            "explanation": f"Grad-CAM highlights the region that most influenced the classification of this cell as **{predicted_class.capitalize()}**.",
            "explanation_image": grad_img
        }

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return {"error": str(e)}
