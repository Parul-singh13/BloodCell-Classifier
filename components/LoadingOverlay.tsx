"use client";

import { useEffect, useState } from "react";

interface StepDef {
  id: string;
  label: string;
}

const STEPS: StepDef[] = [
  { id: "upload",  label: "Uploading image to server" },
  { id: "preproc", label: "Preprocessing & normalization" },
  { id: "infer",   label: "Running model inference" },
  { id: "xai",     label: "Generating XAI explanations" },
  { id: "decode",  label: "Decoding results" },
];

interface LoadingOverlayProps {
  visible: boolean;
  explainers: string[];
}

export default function LoadingOverlay({ visible, explainers }: LoadingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!visible) {
      setCurrentStep(0);
      setElapsed(0);
      return;
    }

    setCurrentStep(0);
    setElapsed(0);

    // Advance steps
    const stepTimings = [800, 1400, 2200, 4000, 6000];
    const timers: ReturnType<typeof setTimeout>[] = [];

    stepTimings.forEach((delay, idx) => {
      const t = setTimeout(() => setCurrentStep(idx + 1), delay);
      timers.push(t);
    });

    // Elapsed counter
    const tick = setInterval(() => setElapsed((p) => p + 1), 1000);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(tick);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(5,11,20,0.88)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.3s ease",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          margin: "0 auto",
          padding: "40px 36px",
          background: "rgba(13,31,56,0.95)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: 20,
          boxShadow: "0 0 60px rgba(0,212,255,0.12)",
          display: "flex",
          flexDirection: "column",
          gap: 28,
        }}
      >
        {/* Top: Spinner + label */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          {/* Outer ring */}
          <div style={{ position: "relative", width: 72, height: 72 }}>
            <div
              className="animate-spin-slow"
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                border: "2px solid transparent",
                borderTopColor: "#00d4ff",
                borderRightColor: "rgba(0,212,255,0.3)",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 8,
                borderRadius: "50%",
                border: "1.5px solid rgba(124,58,237,0.5)",
                animation: "spin-slow 2s linear infinite reverse",
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                inset: "50%",
                transform: "translate(-50%, -50%)",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: "#00d4ff",
                boxShadow: "0 0 12px rgba(0,212,255,0.8)",
              }}
            />
          </div>

          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>
              Analyzing Cell Image
            </h3>
            <p style={{ fontSize: "0.8rem", color: "#475569" }}>
              Running{" "}
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>
                {explainers.map((e) => e.toUpperCase()).join(" + ")}
              </span>{" "}
              explainers
            </p>
          </div>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {STEPS.map((step, idx) => {
            const state =
              idx < currentStep ? "done" : idx === currentStep ? "active" : "pending";
            return (
              <div key={step.id} className={`step-item ${state}`}>
                <div className="step-dot" />
                <span>{step.label}</span>
                {state === "done" && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    style={{ marginLeft: "auto" }}
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {state === "active" && (
                  <span
                    style={{
                      marginLeft: "auto",
                      fontSize: "0.72rem",
                      color: "#00d4ff",
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    running…
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
              fontSize: "0.72rem",
              color: "#475569",
            }}
          >
            <span>Progress</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {Math.min(100, Math.round((currentStep / STEPS.length) * 100))}%
            </span>
          </div>
          <div className="confidence-bar-track">
            <div
              style={{
                width: `${Math.min(100, Math.round((currentStep / STEPS.length) * 100))}%`,
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #0066ff, #00d4ff)",
                transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
                boxShadow: "0 0 8px rgba(0,212,255,0.6)",
              }}
            />
          </div>
        </div>

        {/* Elapsed time */}
        <div style={{ textAlign: "center", fontSize: "0.75rem", color: "#334155" }}>
          Elapsed:{" "}
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: "#475569" }}>
            {elapsed}s
          </span>
        </div>
      </div>
    </div>
  );
}
