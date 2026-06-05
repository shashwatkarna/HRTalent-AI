"use client";

import React, { useMemo } from "react";
import OrgChartNode from "./OrgChartNode";
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
      <div className="bg-slate-50/50 p-8 rounded-2xl border-y md:border border-slate-200 overflow-x-auto shadow-inner min-h-[600px] cursor-grab active:cursor-grabbing">
        {rootNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            No organizational data found.
          </div>
        ) : (
          <div className="org-tree inline-block min-w-full">
            <ul>
              {rootNodes.map(root => (
                <OrgChartNode key={root.id} node={root} currentUserEmail={currentUserEmail} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
