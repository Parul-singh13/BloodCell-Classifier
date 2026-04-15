"use client";

type ExplainerId = "lime" | "gradcam" | "shap";

interface ExplainerInfo {
  id: ExplainerId;
  label: string;
  fullLabel: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  speed: string;
}

const EXPLAINERS: ExplainerInfo[] = [
  {
    id: "lime",
    label: "LIME",
    fullLabel: "Local Interpretable Model-agnostic Explanations",
    description: "Perturbs the image to identify superpixels most influential to the prediction.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#f59e0b",
    speed: "~8s",
  },
  {
    id: "gradcam",
    label: "Grad-CAM",
    fullLabel: "Gradient-weighted Class Activation Mapping",
    description: "Uses gradient signals from the final convolutional layer to produce a heatmap.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#f43f5e",
    speed: "~3s",
  },
  {
    id: "shap",
    label: "SHAP",
    fullLabel: "SHapley Additive exPlanations",
    description: "Game-theoretic approach assigning each pixel a contribution value to the output.",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    color: "#7c3aed",
    speed: "~15s",
  },
];

interface ExplainerSelectorProps {
  selected: ExplainerId[];
  onChange: (ids: ExplainerId[]) => void;
  disabled?: boolean;
}

export default function ExplainerSelector({ selected, onChange, disabled = false }: ExplainerSelectorProps) {
  const toggle = (id: ExplainerId) => {
    if (disabled) return;
    if (selected.includes(id)) {
      if (selected.length === 1) return; // keep at least one
      onChange(selected.filter((x) => x !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <label
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          XAI Explainers
        </label>
        <span style={{ fontSize: "0.7rem", color: "#475569" }}>
          {selected.length} / {EXPLAINERS.length} selected
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {EXPLAINERS.map((exp) => {
          const isActive = selected.includes(exp.id);
          return (
            <button
              key={exp.id}
              id={`explainer-btn-${exp.id}`}
              onClick={() => toggle(exp.id)}
              disabled={disabled}
              style={{
                width: "100%",
                background: isActive ? `rgba(${hexToRgb(exp.color)}, 0.07)` : "rgba(13,31,56,0.5)",
                border: `1.5px solid ${isActive ? exp.color : "rgba(0,212,255,0.1)"}`,
                borderRadius: 12,
                padding: "11px 14px",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                textAlign: "left",
                transition: "all 0.25s ease",
                boxShadow: isActive ? `0 0 14px rgba(${hexToRgb(exp.color)}, 0.18)` : "none",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isActive)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.25)";
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isActive)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.1)";
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  border: `2px solid ${isActive ? exp.color : "#475569"}`,
                  background: isActive ? exp.color : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  marginTop: 1,
                  transition: "all 0.2s",
                }}
              >
                {isActive && (
                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Icon */}
              <div style={{ color: isActive ? exp.color : "#475569", marginTop: 1, transition: "color 0.2s" }}>
                {exp.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 700,
                      color: isActive ? exp.color : "#e2e8f0",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {exp.label}
                  </span>
                  <span style={{ fontSize: "0.65rem", color: "#394969" }}>·</span>
                  <span style={{ fontSize: "0.7rem", color: "#475569" }}>Est. {exp.speed}</span>
                </div>
                <p style={{ fontSize: "0.73rem", color: "#64748b", lineHeight: 1.4 }}>
                  {exp.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Total time estimate */}
      <div
        style={{
          padding: "8px 12px",
          background: "rgba(0,212,255,0.04)",
          border: "1px solid rgba(0,212,255,0.1)",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" strokeLinecap="round" />
        </svg>
        <span style={{ fontSize: "0.73rem", color: "#475569" }}>
          Estimated total:{" "}
          <span style={{ color: "#94a3b8", fontWeight: 600 }}>
            ~{getTotalTime(selected)}s
          </span>
        </span>
      </div>
    </div>
  );
}

function getTotalTime(selected: ExplainerId[]): number {
  const times: Record<ExplainerId, number> = { lime: 8, gradcam: 3, shap: 15 };
  return selected.reduce((acc, id) => acc + times[id], 0);
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
