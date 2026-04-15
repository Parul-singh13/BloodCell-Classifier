import tensorflow as tf
from pathlib import Path

model_path = r"c:\xai-app-streamlit\blood-cell-classifier\backend\models\resnet50.h5"
model = tf.keras.models.load_model(model_path)

print("Top-level layers:")
for i, layer in enumerate(model.layers):
    print(f"{i}: {layer.name} ({type(layer)})")
    if hasattr(layer, 'layers'):
        print(f"  Internal layers for {layer.name}:")
        for j, sublayer in enumerate(layer.layers):
            print(f"    {j}: {sublayer.name} ({type(sublayer)})")

def find_last_conv(m):
    for layer in reversed(m.layers):
        if isinstance(layer, tf.keras.layers.Conv2D):
            return layer.name
        if hasattr(layer, 'layers'):
            res = find_last_conv(layer)
            if res: return res
    return None

print(f"Recursive last conv: {find_last_conv(model)}")
