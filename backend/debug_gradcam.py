import tensorflow as tf
import numpy as np
import sys
from pathlib import Path

# Mock a path for the models
MODELS_DIR = Path('c:/xai-app-streamlit/blood-cell-classifier/backend/models')

def test_gradcam(model_name, last_conv_layer):
    model_path = MODELS_DIR / model_name
    print(f"\n--- Testing {model_name} ---")
    try:
        model = tf.keras.models.load_model(str(model_path))
        print("Model loaded.")
        
        # Construct grad model
        grad_model = tf.keras.models.Model(
            inputs=model.inputs, 
            outputs=[model.get_layer(last_conv_layer).output, model.output]
        )
        print(f"Grad model constructed with layer: {last_conv_layer}")
        
        # Test pass
        img_array = np.random.random((1, 224, 224, 3)).astype(np.float32)
        with tf.GradientTape() as tape:
            # Use model specifically
            outputs = grad_model(img_array)
            print(f"Output type: {type(outputs)}")
            if isinstance(outputs, list):
                print(f"Output list length: {len(outputs)}")
                conv_outputs = outputs[0]
                predictions = outputs[1]
            else:
                # In some cases it might be a dictionary or a single tensor
                print(f"Output object: {outputs}")
                conv_outputs, predictions = outputs

            print(f"conv_outputs type: {type(conv_outputs)}, shape: {conv_outputs.shape}")
            print(f"predictions type: {type(predictions)}, shape: {predictions.shape}")
            
            pred_index = tf.argmax(predictions[0])
            print(f"pred_index: {pred_index}")
            
            # Using tf.gather or boolean masking if slicing fails
            class_channel = predictions[:, pred_index]
            
        grads = tape.gradient(class_channel, conv_outputs)
        if grads is None:
            print("ERROR: Gradients are None!")
        else:
            print(f"Gradients calculated: {grads.shape}")
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Exception: {e}")

if __name__ == "__main__":
    test_gradcam('final_resnet50.h5', 'conv5_block3_out')
    test_gradcam('final_vgg16.h5', 'block5_conv3')
