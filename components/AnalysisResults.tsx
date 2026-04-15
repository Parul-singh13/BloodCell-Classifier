"use client";

import { useState } from "react";

type ExplainerId = "lime" | "gradcam" | "shap";

interface ExplainerResult {
  predicted_class: string;
  confidence: number;
  explanation: string;
  explanation_image: string;
}

type ResultsMap = Partial<Record<ExplainerId, ExplainerResult>>;

const CLASS_META: Record<string, { label: string; badgeClass: string; barClass: string; description: string }> = {
  basophil: {
    label: "Basophil",
    badgeClass: "badge-benign",
    barClass: "bar-benign",
    description: "Granulocytes involved in allergic reactions and inflammatory responses.",
  },
  eosinophil: {
    label: "Eosinophil",
    badgeClass: "badge-early",
    barClass: "bar-early",
    description: "Cells primarily responsible for combating parasitic infections and asthma.",
  },
  lymphocyte: {
    label: "Lymphocyte",
    badgeClass: "badge-pre",
    barClass: "bar-pre",
    description: "Key components of the immune system responsible for antibody production.",
  },
  monocyte: {
    label: "Monocyte",
    badgeClass: "badge-pro",
    barClass: "bar-pro",
    description: "Large leukocytes that differentiate into macrophages to ingest pathogens.",
  },
  neutrophil: {
    label: "Neutrophil",
    badgeClass: "badge-pro",
    barClass: "bar-pro",
    description: "The most abundant type of white blood cell, first responders to infection.",
  },
};

const EXPLAINER_META: Record<
  ExplainerId,
  { label: string; color: string; fullLabel: string }
> = {
  lime: { label: "LIME", color: "#f59e0b", fullLabel: "Local Interpretable Model-agnostic Explanations" },
  gradcam: { label: "Grad-CAM", color: "#f43f5e", fullLabel: "Gradient-weighted Class Activation Mapping" },
  shap: { label: "SHAP", color: "#7c3aed", fullLabel: "SHapley Additive exPlanations" },
};

interface AnalysisResultsProps {
  results: ResultsMap;
  model: string;
}

export default function AnalysisResults({ results, model }: AnalysisResultsProps) {
  const tabs = Object.keys(results) as ExplainerId[];
  const [activeTab, setActiveTab] = useState<ExplainerId>(tabs[0]);

  const activeResult = results[activeTab];
  const classMeta = activeResult
    ? CLASS_META[activeResult.predicted_class] ?? {
        label: activeResult.predicted_class,
        badgeClass: "badge-benign",
        barClass: "bar-benign",
        description: "",
      }
    : null;

  const handleDownload = () => {
    if (!activeResult?.explanation_image) return;
    const link = document.createElement("a");
    link.href = activeResult.explanation_image;
    link.download = `cellscope_${activeTab}_${activeResult.predicted_class}.png`;
    link.click();
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `cellscope_results_${model}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="glass-card animate-fade-up"
      style={{ overflow: "hidden" }}
    >
      {/* Header */}
      <div
        style={{
          padding: "20px 24px",
          borderBottom: "1px solid rgba(0,212,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 8px rgba(16,185,129,0.8)",
            }}
          />
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#e2e8f0" }}>
            Analysis Results
          </h2>
          <span
            style={{
              padding: "2px 10px",
              background: "rgba(0,212,255,0.08)",
              border: "1px solid rgba(0,212,255,0.2)",
              borderRadius: 999,
              fontSize: "0.7rem",
              color: "#94a3b8",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {model}
          </span>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-secondary" id="download-json-btn" onClick={handleDownloadJSON} style={{ fontSize: "0.75rem", padding: "6px 14px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          padding: "12px 24px",
          borderBottom: "1px solid rgba(0,212,255,0.08)",
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
        }}
      >
        {tabs.map((tab) => {
          const meta = EXPLAINER_META[tab];
          return (
            <button
              key={tab}
              id={`tab-btn-${tab}`}
              className={`tab-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
              style={{
                borderColor: activeTab === tab ? `${meta.color}66` : "transparent",
                color: activeTab === tab ? meta.color : undefined,
                background: activeTab === tab ? `rgba(${hexToRgb(meta.color)}, 0.1)` : undefined,
              }}
            >
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeResult && classMeta && (
        <div style={{ padding: "24px" }}>
          {/* Class + Confidence */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {/* Predicted class */}
            <div
              style={{
                padding: "18px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Predicted Class
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span
                  className={classMeta.badgeClass}
                  style={{
                    padding: "5px 14px",
                    borderRadius: 8,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    letterSpacing: "0.03em",
                  }}
                >
                  {classMeta.label}
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "#64748b", marginTop: 8, lineHeight: 1.5 }}>
                {classMeta.description}
              </p>
            </div>

            {/* Confidence */}
            <div
              style={{
                padding: "18px 20px",
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
              }}
            >
              <div style={{ fontSize: "0.7rem", color: "#475569", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Confidence Score
              </div>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#e2e8f0",
                  marginBottom: 10,
                  lineHeight: 1,
                }}
              >
                {(activeResult.confidence * 100).toFixed(1)}
                <span style={{ fontSize: "1rem", fontWeight: 400, color: "#475569" }}>%</span>
              </div>
              <div className="confidence-bar-track">
                <div
                  className={`confidence-bar-fill ${classMeta.barClass}`}
                  style={{ width: `${(activeResult.confidence * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Explainer label */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: EXPLAINER_META[activeTab].color,
                    textTransform: "uppercase",
                    letterSpacing: "0.07em",
                  }}
                >
                  {EXPLAINER_META[activeTab].label}
                </span>
                <span style={{ color: "#334155", margin: "0 8px" }}>·</span>
                <span style={{ fontSize: "0.72rem", color: "#475569" }}>
                  {EXPLAINER_META[activeTab].fullLabel}
                </span>
              </div>
              <button
                id="download-image-btn"
                className="btn-secondary"
                onClick={handleDownload}
                style={{ fontSize: "0.72rem", padding: "5px 12px" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Download
              </button>
            </div>

            {/* Explanation image */}
            {activeResult.explanation_image ? (
              <div
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgba(0,212,255,0.12)",
                  background: "#050b14",
                }}
              >
                <img
                  src={activeResult.explanation_image}
                  alt={`${EXPLAINER_META[activeTab].label} explanation heatmap`}
                  style={{ width: "100%", display: "block", maxHeight: 400, objectFit: "contain" }}
                />
              </div>
            ) : (
              <div
                style={{
                  height: 200,
                  borderRadius: 12,
                  border: "1px dashed rgba(0,212,255,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#334155",
                  fontSize: "0.8rem",
                }}
              >
                No explanation image available
              </div>
            )}
          </div>

          {/* Text explanation */}
          {activeResult.explanation && (
            <div
              style={{
                padding: "14px 16px",
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: 10,
                marginTop: 12,
              }}
            >
              <div style={{ fontSize: "0.68rem", color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                Explanation
              </div>
              <p style={{ fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.6 }}>
                {activeResult.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
