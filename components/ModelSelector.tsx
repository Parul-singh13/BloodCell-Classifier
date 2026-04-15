"use client";

type ModelId = "ResNet50" | "EfficientNetB0" | "VGG16";

interface ModelInfo {
  id: ModelId;
  label: string;
  accuracy: number;
  badge: string;
  description: string;
  params: string;
  color: string;
}

const MODELS: ModelInfo[] = [
  {
    id: "ResNet50",
    label: "ResNet-50",
    accuracy: 96.4,
    badge: "High Accuracy",
    description: "Deep residual network with skip connections. Excellent at capturing fine-grained morphological features.",
    params: "25.6M",
    color: "#00d4ff",
  },
  {
    id: "VGG16",
    label: "VGG-16",
    accuracy: 93.8,
    badge: "Classic",
    description: "Deep sequential architecture. Robust baseline with strong feature extraction.",
    params: "138M",
    color: "#7c3aed",
  },
];

interface ModelSelectorProps {
  selected: ModelId;
  onChange: (id: ModelId) => void;
  disabled?: boolean;
}

export default function ModelSelector({ selected, onChange, disabled = false }: ModelSelectorProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <label
        style={{
          fontSize: "0.7rem",
          fontWeight: 600,
          color: "#475569",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
        }}
      >
        Classification Model
      </label>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {MODELS.map((model) => {
          const isActive = selected === model.id;
          return (
            <button
              key={model.id}
              id={`model-btn-${model.id}`}
              onClick={() => !disabled && onChange(model.id)}
              disabled={disabled}
              style={{
                width: "100%",
                background: isActive ? `rgba(${hexToRgb(model.color)}, 0.08)` : "rgba(13,31,56,0.5)",
                border: `1.5px solid ${isActive ? model.color : "rgba(0,212,255,0.1)"}`,
                borderRadius: 12,
                padding: "12px 16px",
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                textAlign: "left",
                transition: "all 0.25s ease",
                boxShadow: isActive ? `0 0 16px rgba(${hexToRgb(model.color)}, 0.2)` : "none",
              }}
              onMouseEnter={(e) => {
                if (!disabled && !isActive)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.3)";
              }}
              onMouseLeave={(e) => {
                if (!disabled && !isActive)
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,212,255,0.1)";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                {/* Radio dot */}
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: `2px solid ${isActive ? model.color : "#475569"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 2,
                    transition: "border-color 0.25s",
                  }}
                >
                  {isActive && (
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: model.color,
                        boxShadow: `0 0 6px ${model.color}`,
                      }}
                    />
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Header row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: isActive ? model.color : "#e2e8f0",
                      }}
                    >
                      {model.label}
                    </span>
                    <span
                      style={{
                        padding: "1px 8px",
                        background: isActive ? `rgba(${hexToRgb(model.color)}, 0.15)` : "rgba(255,255,255,0.05)",
                        border: `1px solid ${isActive ? `rgba(${hexToRgb(model.color)}, 0.3)` : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 999,
                        fontSize: "0.65rem",
                        fontWeight: 600,
                        color: isActive ? model.color : "#475569",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {model.badge}
                    </span>
                  </div>

                  <p style={{ fontSize: "0.75rem", color: "#64748b", marginBottom: 8, lineHeight: 1.4 }}>
                    {model.description}
                  </p>

                  {/* Stats */}
                  <div style={{ display: "flex", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "#475569", marginBottom: 2 }}>Accuracy</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div
                          style={{
                            width: 64,
                            height: 4,
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: 999,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${model.accuracy}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${model.color}88, ${model.color})`,
                              borderRadius: 999,
                              transition: "width 0.6s ease",
                            }}
                          />
                        </div>
                        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: model.color, fontFamily: "'JetBrains Mono', monospace" }}>
                          {model.accuracy}%
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.65rem", color: "#475569", marginBottom: 2 }}>Parameters</div>
                      <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", fontFamily: "'JetBrains Mono', monospace" }}>
                        {model.params}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r},${g},${b}`;
}
