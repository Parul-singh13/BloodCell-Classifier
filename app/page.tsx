"use client";

import { useCallback, useEffect, useState } from "react";
import Header from "@/components/Header";
import UploadZone from "@/components/UploadZone";
import ModelSelector from "@/components/ModelSelector";
import ExplainerSelector from "@/components/ExplainerSelector";
import AnalysisResults from "@/components/AnalysisResults";
import LoadingOverlay from "@/components/LoadingOverlay";

type ModelId = "ResNet50" | "VGG16";
type ExplainerId = "lime" | "gradcam" | "shap";

interface ExplainerResult {
  predicted_class: string;
  confidence: number;
  explanation: string;
  explanation_image: string;
}

type ResultsMap = Partial<Record<ExplainerId, ExplainerResult>>;

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function Home() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [model, setModel] = useState<ModelId>("ResNet50");
  const [explainers, setExplainers] = useState<ExplainerId[]>(["gradcam"]);
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState<ResultsMap | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  // Ping backend on mount
  useEffect(() => {
    fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) })
      .then((r) => setIsConnected(r.ok))
      .catch(() => setIsConnected(false));
  }, []);

  const handleImageSelect = useCallback((file: File, preview: string) => {
    setImageFile(file);
    setImagePreview(preview);
    setResults(null);
    setError(null);
  }, []);

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setAnalyzing(true);
    setResults(null);
    setError(null);

    try {
      const form = new FormData();
      form.append("image", imageFile);
      form.append("model", model);
      form.append("explainers", JSON.stringify(explainers));

      const res = await fetch(`${BACKEND_URL}/analyze`, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const msg = await res.text();
        throw new Error(`Server error ${res.status}: ${msg}`);
      }

      const data: ResultsMap = await res.json();
      setResults(data);
      setAnalysisCount((c) => c + 1);
      setIsConnected(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
      setIsConnected(false);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResults(null);
    setError(null);
  };

  const canAnalyze = !!imageFile && !analyzing;

  return (
    <>
      <LoadingOverlay visible={analyzing} explainers={explainers} />

      <Header analysisCount={analysisCount} isConnected={isConnected} />

      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Hero Banner */}
        <div
          style={{
            textAlign: "center",
            marginBottom: 48,
            animation: "fadeUp 0.7s ease forwards",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 16px",
              background: "rgba(0,102,255,0.1)",
              border: "1px solid rgba(0,102,255,0.25)",
              borderRadius: 999,
              marginBottom: 16,
              fontSize: "0.75rem",
              color: "#7cb9ff",
              fontWeight: 500,
            }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#00d4ff", boxShadow: "0 0 8px #00d4ff" }} />
            Powered by LIME · Grad-CAM · SHAP
          </div>
          <h1
            style={{
              fontSize: "clamp(2rem, 5vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              color: "#e2e8f0",
              marginBottom: 14,
            }}
          >
            Blood Cell{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #0066ff, #00d4ff)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Classification
            </span>
            <br />
            with Explainable AI
          </h1>
          <p
            style={{
              fontSize: "1rem",
              color: "#64748b",
              maxWidth: 560,
              margin: "0 auto",
              lineHeight: 1.7,
            }}
          >
            Upload a blood cell microscopy image. Select your model and XAI explainers.
            Get instant classification with visual explanations.
          </p>
        </div>

        {/* Stats row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: 12,
            marginBottom: 36,
            animation: "fadeUp 0.8s ease 0.1s both",
          }}
        >
          {[
            { label: "Cell Classes", value: "5", sub: "basophil · eosinophil · lymphocyte..." },
            { label: "AI Models", value: "2", sub: "ResNet-50 · VGG-16" },
            { label: "XAI Methods", value: "3", sub: "LIME · Grad-CAM · SHAP" },
            { label: "Avg. Accuracy", value: "95.1%", sub: "across available models" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card"
              style={{ padding: "16px 20px", textAlign: "center" }}
            >
              <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "#e2e8f0", fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "0.7rem", color: "#00d4ff", fontWeight: 600, margin: "4px 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {stat.label}
              </div>
              <div style={{ fontSize: "0.68rem", color: "#334155" }}>{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Main layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)",
            gap: 24,
            alignItems: "start",
            animation: "fadeUp 0.8s ease 0.15s both",
          }}
        >
          {/* ——— LEFT PANEL ——— */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Upload */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <UploadZone
                onImageSelect={handleImageSelect}
                preview={imagePreview}
                isAnalyzing={analyzing}
              />
            </div>

            {/* Model */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <ModelSelector selected={model} onChange={setModel} disabled={analyzing} />
            </div>

            {/* Explainers */}
            <div className="glass-card" style={{ padding: "24px" }}>
              <ExplainerSelector selected={explainers} onChange={setExplainers} disabled={analyzing} />
            </div>

            {/* CTA */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <button
                id="analyze-btn"
                className="btn-primary"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                style={{ width: "100%", padding: "14px", fontSize: "0.95rem" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {analyzing ? "Analyzing…" : "Run Analysis"}
              </button>

              {(imageFile || results) && (
                <button
                  id="reset-btn"
                  className="btn-secondary"
                  onClick={handleReset}
                  style={{ width: "100%" }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* ——— RIGHT PANEL ——— */}
          <div>
            {error && (
              <div
                style={{
                  padding: "16px 20px",
                  background: "rgba(244,63,94,0.08)",
                  border: "1px solid rgba(244,63,94,0.25)",
                  borderRadius: 12,
                  marginBottom: 20,
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-start",
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
                </svg>
                <div>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#f43f5e", marginBottom: 3 }}>
                    Analysis Failed
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", lineHeight: 1.5 }}>{error}</div>
                </div>
              </div>
            )}

            {results && Object.keys(results).length > 0 ? (
              <AnalysisResults results={results} model={model} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div
      className="glass-card"
      style={{
        minHeight: 520,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
        padding: "48px 32px",
        textAlign: "center",
      }}
    >
      {/* Animated DNA / cell icon */}
      <div style={{ position: "relative", width: 100, height: 100 }}>
        <div
          className="animate-spin-slow"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            border: "1.5px solid rgba(0,212,255,0.15)",
            position: "absolute",
          }}
        />
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            border: "1.5px solid rgba(0,102,255,0.2)",
            position: "absolute",
            top: 10,
            left: 10,
            animation: "spin-slow 6s linear infinite reverse",
          }}
        />
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "rgba(0,212,255,0.05)",
            border: "1px solid rgba(0,212,255,0.15)",
            position: "absolute",
            top: 20,
            left: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="rgba(0,212,255,0.7)" strokeWidth="1.2">
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 8 }}>
          Ready for Analysis
        </h3>
        <p style={{ fontSize: "0.83rem", color: "#475569", lineHeight: 1.6, maxWidth: 340 }}>
          Upload a blood cell microscopy image on the left, select your model and XAI explainers, then click{" "}
          <span style={{ color: "#00d4ff", fontWeight: 600 }}>Run Analysis</span>.
        </p>
      </div>

      {/* Class legend */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", marginTop: 8 }}>
        {[
          { label: "Basophil", cls: "badge-benign" },
          { label: "Eosinophil", cls: "badge-early" },
          { label: "Lymphocyte", cls: "badge-pre" },
          { label: "Monocyte", cls: "badge-pro" },
          { label: "Neutrophil", cls: "badge-pro" },
        ].map((b) => (
          <span key={b.label} className={b.cls} style={{ padding: "4px 12px", borderRadius: 8, fontSize: "0.75rem", fontWeight: 600 }}>
            {b.label}
          </span>
        ))}
      </div>

      {/* Decorative grid lines */}
      <svg
        width="300"
        height="80"
        viewBox="0 0 300 80"
        style={{ opacity: 0.08, position: "absolute", bottom: 40 }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={i} x1={i * 75} y1={0} x2={i * 75} y2={80} stroke="#00d4ff" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={0} y1={i * 26} x2={300} y2={i * 26} stroke="#00d4ff" strokeWidth="0.5" />
        ))}
      </svg>
    </div>
  );
}
