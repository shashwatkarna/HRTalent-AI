"use client";

import React, { useMemo } from "react";
import OrgChartNode from "./OrgChartNode";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import "./org-chart.css";

const sortNodes = (nodes: any[]) => {
  nodes.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  nodes.forEach(n => {
    if (n.children.length > 0) {
      sortNodes(n.children);
    }
  });
};

export default function DirectoryClient({ initialUsers, currentUserEmail }: { initialUsers: any[], currentUserEmail?: string }) {

  // Build the hierarchical tree from the flat user array
  const rootNodes = useMemo(() => {
    const map = new Map();
    
    // First pass: create all nodes
    initialUsers.forEach(user => {
      if (user.employeeProfile) {
        map.set(user.employeeProfile.id, { ...user, children: [] });
      }
    });

    const roots: any[] = [];

    // Second pass: link children to parents
    initialUsers.forEach(user => {
      if (!user.employeeProfile) return;
      
      const node = map.get(user.employeeProfile.id);
      
      if (user.employeeProfile.managerId) {
        const parent = map.get(user.employeeProfile.managerId);
        if (parent) {
          parent.children.push(node);
        } else {
          // If manager not found in dataset, treat as root
          roots.push(node);
        }
      } else {
        // No managerId means it's a top-level node
        roots.push(node);
      }
    });

    // Sort nodes horizontally by name
    sortNodes(roots);

    return roots;
  }, [initialUsers]);

  return (
    <div className="space-y-6 max-w-[100vw] mx-auto animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="px-6 md:px-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organization Chart</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Explore the company hierarchy and reporting structure. Your profile is highlighted in blue.</p>
      </div>

      {/* Flowchart Canvas */}
      <div className="bg-slate-50/50 p-2 md:p-8 rounded-2xl border-y md:border border-slate-200 shadow-inner h-[70vh] min-h-[600px] relative overflow-hidden">
        {rootNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            No organizational data found.
          </div>
        ) : (
          <TransformWrapper
            initialScale={0.4}
            minScale={0.1}
            maxScale={2}
            centerOnInit={true}
            limitToBounds={false}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                {/* Zoom Controls */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10 bg-white/80 backdrop-blur border border-slate-200 rounded-lg p-1.5 shadow-sm">
                  <button onClick={() => zoomIn()} className="p-2 hover:bg-slate-100 rounded text-slate-700 transition" title="Zoom In">
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button onClick={() => zoomOut()} className="p-2 hover:bg-slate-100 rounded text-slate-700 transition" title="Zoom Out">
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <button onClick={() => resetTransform()} className="p-2 hover:bg-slate-100 rounded text-slate-700 transition" title="Reset View">
                    <Maximize className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Pan/Zoom Canvas */}
                <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "max-content", height: "max-content", padding: "40px" }}>
                  <div className="org-tree inline-block cursor-grab active:cursor-grabbing min-w-max">
                    <ul>
                      {rootNodes.map(root => (
                        <OrgChartNode key={root.id} node={root} currentUserEmail={currentUserEmail} />
                      ))}
                    </ul>
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}
