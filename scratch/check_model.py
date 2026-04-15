import tensorflow as tf
from pathlib import Path

model_path = r"c:\xai-app-streamlit\blood-cell-classifier\backend\models\resnet50.h5"
if not Path(model_path).exists():
    print(f"Model not found at {model_path}")
else:
    model = tf.keras.models.load_model(model_path)
    print(f"Model summary for {model_path}:")
    model.summary()
    print(f"Output shape: {model.output_shape}")
    print(f"Input shape: {model.input_shape}")
