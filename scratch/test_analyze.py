import requests
import json

URL = "http://localhost:8000/analyze"
IMAGE_PATH = r"c:\xai-app-streamlit\temp_WBC-Malignant-Early-935.jpg"

with open(IMAGE_PATH, "rb") as f:
    files = {"image": f}
    data = {
        "model": "ResNet50",
        "explainers": json.dumps(["gradcam"])
    }
    response = requests.post(URL, files=files, data=data)

print(f"Status Code: {response.status_code}")
try:
    print(f"Response: {json.dumps(response.json(), indent=2)[:500]}...")
except:
    print(f"Response (text): {response.text}")
