import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CellScope — AI Blood Cell Classifier",
  description: "AI-powered blood cell classification with Explainable AI (LIME, Grad-CAM, SHAP). Analyze benign, early, pre, and pro-malignant cell types instantly.",
  keywords: ["blood cell classifier", "AI", "explainable AI", "LIME", "Grad-CAM", "SHAP", "medical AI"],
  openGraph: {
    title: "CellScope — AI Blood Cell Classifier",
    description: "AI-powered blood cell classification with Explainable AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <div className="grid-bg" />
        <div className="radial-glow" />
        <div style={{ position: "relative", zIndex: 1 }}>
          {children}
        </div>
      </body>
    </html>
  );
}
