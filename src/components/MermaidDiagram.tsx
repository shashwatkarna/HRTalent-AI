"use client";

import React, { useEffect, useRef, useState } from "react";

interface MermaidDiagramProps {
  chart: string;
}

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [rendered, setRendered] = useState(false);

  useEffect(() => {
    const renderChart = async () => {
      if (!window.mermaid) {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js";
        script.async = true;
        document.body.appendChild(script);
        script.onload = () => {
          window.mermaid.initialize({ 
            startOnLoad: false, 
            theme: "base",
            themeVariables: {
              darkMode: true,
              primaryColor: "#0f172a",
              primaryTextColor: "#f1f5f9",
              primaryBorderColor: "#3b82f6",
              lineColor: "#64748b",
              secondaryColor: "#1e293b",
              tertiaryColor: "#0f172a",
              background: "transparent",
            }
          });
          renderMermaid();
        };
      } else {
        renderMermaid();
      }
    };

    const renderMermaid = async () => {
      try {
        if (ref.current) {
          const { svg } = await window.mermaid.render(`mermaid-${Math.random().toString(36).substr(2, 9)}`, chart);
          ref.current.innerHTML = svg;
          setRendered(true);
        }
      } catch (err) {
        console.error("Mermaid error:", err);
      }
    };

    renderChart();
  }, [chart]);

  return (
    <div className="w-full flex justify-center p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-xl overflow-x-auto">
      {!rendered && <div className="text-slate-400 py-20 font-mono text-sm animate-pulse">Loading Architecture Diagram...</div>}
      <div ref={ref} className={!rendered ? "hidden" : "w-full max-w-5xl flex justify-center"} />
    </div>
  );
}

declare global {
  interface Window {
    mermaid: any;
  }
}
