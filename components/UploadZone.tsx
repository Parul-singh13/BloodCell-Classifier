"use client";

import { useCallback, useRef, useState } from "react";

interface UploadZoneProps {
  onImageSelect: (file: File, preview: string) => void;
  preview: string | null;
  isAnalyzing: boolean;
}

export default function UploadZone({ onImageSelect, preview, isAnalyzing }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      onImageSelect(file, url);
    },
    [onImageSelect]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };
  const onDragLeave = () => setDragging(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={{ fontSize: "0.7rem", fontWeight: 600, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Input Image
      </label>

      <div
        className={`upload-zone ${dragging ? "dragging" : ""}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !preview && inputRef.current?.click()}
        style={{
          minHeight: preview ? "auto" : 220,
          cursor: preview ? "default" : "pointer",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          padding: preview ? 0 : 32,
          overflow: "hidden",
        }}
      >
        {preview ? (
          <div className="scan-container" style={{ width: "100%", borderRadius: 14 }}>
            {/* Preview image */}
            <img
              src={preview}
              alt="Uploaded blood cell image"
              style={{
                width: "100%",
                maxHeight: 320,
                objectFit: "contain",
                borderRadius: 14,
                display: "block",
              }}
            />

            {/* Scanning animation while analyzing */}
            {isAnalyzing && <div className="scan-line" />}

            {/* Corner markers */}
            {["top-left", "top-right", "bottom-left", "bottom-right"].map((pos) => {
              const isTop = pos.includes("top");
              const isLeft = pos.includes("left");
              return (
                <div
                  key={pos}
                  style={{
                    position: "absolute",
                    top: isTop ? 8 : "auto",
                    bottom: isTop ? "auto" : 8,
                    left: isLeft ? 8 : "auto",
                    right: isLeft ? "auto" : 8,
                    width: 18,
                    height: 18,
                    borderTop: isTop ? "2px solid #00d4ff" : "none",
                    borderBottom: isTop ? "none" : "2px solid #00d4ff",
                    borderLeft: isLeft ? "2px solid #00d4ff" : "none",
                    borderRight: isLeft ? "none" : "2px solid #00d4ff",
                    borderRadius: isTop && isLeft ? "4px 0 0 0" : isTop ? "0 4px 0 0" : isLeft ? "0 0 0 4px" : "0 0 4px 0",
                    opacity: isAnalyzing ? 1 : 0.5,
                    transition: "opacity 0.3s",
                    boxShadow: isAnalyzing ? "0 0 8px rgba(0,212,255,0.6)" : "none",
                  }}
                />
              );
            })}

            {/* Change image overlay */}
            {!isAnalyzing && (
              <div
                onClick={() => inputRef.current?.click()}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(5,11,20,0.7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0,
                  cursor: "pointer",
                  borderRadius: 14,
                  transition: "opacity 0.2s",
                  flexDirection: "column",
                  gap: 8,
                }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0")}
              >
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                  <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span style={{ color: "#00d4ff", fontSize: "0.8rem", fontWeight: 500 }}>Change Image</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Upload icon */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,212,255,0.07)",
                border: "1.5px solid rgba(0,212,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
              }}
              className={dragging ? "animate-bounce-subtle" : ""}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="1.5">
                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.9rem", fontWeight: 500, marginBottom: 4 }}>
                Drop your blood cell image here
              </p>
              <p style={{ color: "#475569", fontSize: "0.78rem" }}>
                or{" "}
                <span style={{ color: "#00d4ff", fontWeight: 600 }}>click to browse</span>
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              {["JPG", "PNG", "TIFF", "BMP"].map((fmt) => (
                <span
                  key={fmt}
                  style={{
                    padding: "3px 8px",
                    background: "rgba(0,212,255,0.06)",
                    border: "1px solid rgba(0,212,255,0.15)",
                    borderRadius: 6,
                    fontSize: "0.7rem",
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "#475569",
                  }}
                >
                  {fmt}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        id="image-upload-input"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
