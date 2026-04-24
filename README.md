 🔬 CellScope AI: Blood Cell Classifier

CellScope AI is a state-of-the-art medical imaging platform designed to automate the classification of blood cells using Deep Learning. It specializes in the **5-part differential** blood count, providing clinicians and researchers with instant predictions coupled with **Explainable AI (XAI)** to ensure transparency in model decision-making.

---

## 🌟 Key Features

- **5-Part Differential Classification**: Detects and classifies Basophils, Eosinophils, Lymphocytes, Monocytes, and Neutrophils.
- **Explainable AI (XAI) Integration**: Includes three powerful explainer modules to visualize *why* the model made a prediction:
  - **Grad-CAM**: Regional focus maps identifying significant features.
  - **LIME**: Local interpretable model-agnostic explanations.
  - **SHAP**: SHapley Value-based contribution heatmaps.
- **Multiple Model Support**: Toggle between specialized architectures like **ResNet50** and **VGG16**.
- **Modern Web Interface**: A sleek, responsive dashboard built with Next.js 15 and Tailwind CSS.

<img width="1916" height="839" alt="Screenshot 2026-04-15 192830" src="https://github.com/user-attachments/assets/cbc2252e-aa34-4c34-a60b-b69109590773" />
<img width="1899" height="867" alt="Screenshot 2026-04-23 010746" src="https://github.com/user-attachments/assets/8dc7a75d-b6f3-467b-a00f-ea3d5b1546c6" />
<img width="1906" height="861" alt="Screenshot 2026-04-23 010758" src="https://github.com/user-attachments/assets/640b12e1-bab9-424c-a7a6-d52bbe27fec9" />





---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**: React 19 Hooks
- **Type Safety**: TypeScript

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **ML Engine**: TensorFlow / Keras
- **XAI Libraries**: SHAP, LIME, OpenCV (for Grad-CAM)
- **Server**: Uvicorn

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- Python (3.9+)
- Docker (optional, for backend containerization)

### 2. Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd blood-cell-classifier/backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Place your model files (`final_resnet50.h5`, `final_vgg16.h5`) in the `backend/models/` folder.
4. Start the FastAPI server:
   ```bash
   python main.py
   ```
   *The API will be available at http://localhost:8000*

### 3. Frontend Setup
1. Navigate to the root directory:
   ```bash
   cd blood-cell-classifier
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── backend/                # FastAPI Application
│   ├── models/             # Trained .h5 model files
│   ├── main.py             # API Endpoints
│   ├── grad.py             # Grad-CAM Implementation
│   ├── lime_ex.py          # LIME Implementation
│   └── shap_ex.py          # SHAP Implementation
├── app/                    # Next.js App Router Pages
├── components/             # Reusable React Components (UploadZone, ExplainerCard)
├── public/                 # Static Assets
└── package.json            # Frontend Dependencies
```

---

## 🧪 Explainable AI (XAI) Overview

- **Grad-CAM**: Visualizes the gradients of the target concept flowing into the last convolutional layer to produce a localization map highlighting the important regions in the image for prediction.
- **LIME**: Perturbs the input image and observes the changes in output to build a local linear model that explains the prediction.
- **SHAP**: Assigns each feature an importance value for a particular prediction based on game theory principles.

---

## 📄 License

This project is intended for research and educational purposes. Ensure compliance with medical data privacy regulations (HIPAA/GDPR) when using clinical datasets.
