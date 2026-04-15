"""
CellScope FastAPI Backend
Works with the existing lime_ex.py, grad.py, shap_ex.py in this directory.

All three XAI modules use the signature:
    run_*(model, img_path) -> dict with keys:
        predicted_class, confidence, explanation, explanation_image
        (explanation_image is already a data-URI string, e.g. "data:image/png;base64,...")
"""

import json
import os
import sys
import tempfile
import traceback
from pathlib import Path
from typing import List

import uvicorn
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# ── Point Python at this directory so sibling modules are importable ─────────
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))

# ── TensorFlow / Keras ───────────────────────────────────────────────────────
import tensorflow as tf
from typing import Any

# ── Your existing XAI modules ────────────────────────────────────────────────
try:
    from lime_ex import run_lime
    LIME_AVAILABLE = True
except ImportError as e:
    LIME_AVAILABLE = False
    print(f"[WARN] lime_ex.py not importable: {e}")

try:
    from grad import run_gradcam
    GRADCAM_AVAILABLE = True
except ImportError as e:
    GRADCAM_AVAILABLE = False
    print(f"[WARN] grad.py not importable: {e}")

try:
    from shap_ex import run_shap
    SHAP_AVAILABLE = True
except ImportError as e:
    SHAP_AVAILABLE = False
    print(f"[WARN] shap_ex.py not importable: {e}")

# ── Model paths ──────────────────────────────────────────────────────────────
MODELS_DIR = HERE / "models"

MODEL_FILES = {
    "ResNet50":       MODELS_DIR / "final_resnet50.h5",
    "VGG16":          MODELS_DIR / "final_vgg16.h5",
}

# ── App setup ────────────────────────────────────────────────────────────────
app = FastAPI(title="CellScope API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Model cache ──────────────────────────────────────────────────────────────
_model_cache: dict = {}


def load_model(model_name: str) -> Any:
    if model_name in _model_cache:
        return _model_cache[model_name]

    path = MODEL_FILES.get(model_name)
    if path is None or not path.exists():
        raise HTTPException(
            status_code=404,
            detail=(
                f"Model file not found: {path}. "
                f"Ensure '{model_name.lower()}.h5' exists inside models/"
            ),
        )

    print(f"[INFO] Loading model: {model_name} from {path}")
    model = tf.keras.models.load_model(str(path))
    _model_cache[model_name] = model
    print(f"[INFO] Model loaded: {model_name}")
    return model


# ── Helpers ──────────────────────────────────────────────────────────────────

def _normalise_result(raw: dict | None, explainer_id: str) -> dict:
    """
    Ensure the result dict always has the four expected keys.
    The existing modules return explanation_image as a bare base64 string (lime_ex)
    OR as a full data-URI (grad, shap). Normalise to data-URI.
    """
    if raw is None or "error" in raw:
        return {
            "predicted_class":   "unknown",
            "confidence":        0.0,
            "explanation":       raw.get("error", "No result") if raw else "No result",
            "explanation_image": "",
        }

    img = raw.get("explanation_image", "")
    # lime_ex returns bare base64 without the data-URI prefix
    if img and not img.startswith("data:"):
        img = f"data:image/png;base64,{img}"

    return {
        "predicted_class":   raw.get("predicted_class", "unknown"),
        "confidence":        float(raw.get("confidence", 0.0)),
        "explanation":       raw.get("explanation", ""),
        "explanation_image": img,
    }


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {
        "status":            "ok",
        "lime_available":    LIME_AVAILABLE,
        "gradcam_available": GRADCAM_AVAILABLE,
        "shap_available":    SHAP_AVAILABLE,
        "models_found":      {k: v.exists() for k, v in MODEL_FILES.items()},
    }


@app.post("/analyze")
async def analyze(
    image:     UploadFile = File(...),
    model:     str        = Form("ResNet50"),
    explainers: str       = Form('["gradcam"]'),
):
    """
    Multipart POST:
      image      – image file (jpg/png)
      model      – "ResNet50" | "EfficientNetB0" | "VGG16"
      explainers – JSON array  e.g. '["lime","gradcam","shap"]'
    """
    # Parse explainers
    try:
        explainer_list: List[str] = json.loads(explainers)
    except json.JSONDecodeError:
        raise HTTPException(status_code=422, detail="explainers must be a valid JSON array")

    # Load model
    keras_model = load_model(model)

    # Save uploaded image to a temporary file (the XAI modules need a path)
    suffix = Path(image.filename or "upload.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await image.read())
        tmp_path = tmp.name

    results: dict = {}

    try:
        for exp_id in explainer_list:
            try:
                if exp_id == "lime":
                    if not LIME_AVAILABLE:
                        results["lime"] = _normalise_result({"error": "LIME module not installed"}, exp_id)
                        continue
                    raw = run_lime(keras_model, tmp_path)
                    results["lime"] = _normalise_result(raw, exp_id)

                elif exp_id == "gradcam":
                    if not GRADCAM_AVAILABLE:
                        results["gradcam"] = _normalise_result({"error": "Grad-CAM module not installed"}, exp_id)
                        continue
                    raw = run_gradcam(keras_model, tmp_path)
                    results["gradcam"] = _normalise_result(raw, exp_id)

                elif exp_id == "shap":
                    if not SHAP_AVAILABLE:
                        results["shap"] = _normalise_result({"error": "SHAP module not installed"}, exp_id)
                        continue
                    raw = run_shap(keras_model, tmp_path)
                    results["shap"] = _normalise_result(raw, exp_id)

                else:
                    results[exp_id] = _normalise_result({"error": f"Unknown explainer: {exp_id}"}, exp_id)

            except Exception:
                tb = traceback.format_exc()
                print(f"[ERROR] Explainer '{exp_id}' failed:\n{tb}")
                results[exp_id] = _normalise_result({"error": tb[-300:]}, exp_id)
    finally:
        # Always clean up the temp file
        try:
            os.unlink(tmp_path)
        except OSError:
            pass

    if not results:
        raise HTTPException(status_code=500, detail="No explainers produced results")

    return results


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
