"use client";

import { useEffect, useState } from "react";

interface HeaderProps {
  analysisCount: number;
  isConnected: boolean;
}

export default function Header({ analysisCount, isConnected }: HeaderProps) {
  const [time, setTime] = useState<string>("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      style={{
        borderBottom: "1px solid rgba(0,212,255,0.12)",
        background: "rgba(5,11,20,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #0066ff, #00d4ff)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 18px rgba(0,212,255,0.35)",
              flexShrink: 0,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
              <circle cx="12" cy="12" r="4" fill="white" fillOpacity="0.9" />
              <circle cx="12" cy="12" r="1.5" fill="white" />
              <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#e2e8f0", lineHeight: 1.1 }}>
              Cell<span style={{ color: "#00d4ff" }}>Scope</span>
            </h1>
            <p style={{ fontSize: "0.65rem", color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Blood Cell Classifier
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          {/* Connection Status */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "5px 12px",
              borderRadius: 999,
              background: isConnected
                ? "rgba(16,185,129,0.1)"
                : "rgba(244,63,94,0.1)",
              border: `1px solid ${isConnected ? "rgba(16,185,129,0.25)" : "rgba(244,63,94,0.25)"}`,
            }}
          >
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: isConnected ? "#10b981" : "#f43f5e",
                boxShadow: isConnected
                  ? "0 0 8px rgba(16,185,129,0.8)"
                  : "0 0 8px rgba(244,63,94,0.8)",
              }}
            />
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 500,
                color: isConnected ? "#10b981" : "#f43f5e",
              }}
            >
              {isConnected ? "API Online" : "API Offline"}
            </span>
          </div>

          {/* Analysis Count */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(0,212,255,0.07)",
              border: "1px solid rgba(0,212,255,0.18)",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
              <path d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#00d4ff" }}>
              {analysisCount.toLocaleString()} Analyzed
            </span>
          </div>

          {/* Clock */}
          {mounted && (
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "0.8rem",
                color: "#475569",
                letterSpacing: "0.05em",
                minWidth: 58,
              }}
            >
              {time}
            </div>
          )}
        </div>
      </div>

      {/* Animated gradient underline */}
      <div
        style={{
          height: 1,
          background:
            "linear-gradient(90deg, transparent 0%, #0066ff 30%, #00d4ff 50%, #7c3aed 70%, transparent 100%)",
          opacity: 0.6,
        }}
      />
    </header>
  );
}
