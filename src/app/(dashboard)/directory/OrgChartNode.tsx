"use client";

import React, { useState } from 'react';
import { User, ChevronDown, ChevronUp, Briefcase, Building } from 'lucide-react';
import dynamic from 'next/dynamic';

const OrgChartChildren = dynamic(() => import('./OrgChartChildren'), { 
  ssr: false,
  loading: () => <div className="text-xs text-slate-400 my-2">Loading chart...</div>
});

export default function OrgChartNode({ node, currentUserEmail }: { node: any, currentUserEmail?: string }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const profile = node.employeeProfile || {};
  const isCurrentUser = node.email === currentUserEmail;

  return (
    <li>
      <div className={`org-node-card relative bg-white border ${isCurrentUser ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 'border-slate-200'} rounded-xl shadow-sm p-4 w-60 mx-auto inline-block text-center`}>
        {/* Highlight badge for current user */}
        {isCurrentUser && (
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider z-10">
            You
          </span>
        )}

        {/* Avatar */}
        <div className="w-12 h-12 rounded-full border border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center shadow-inner mx-auto mb-3">
          {node.image ? (
            <img src={node.image} alt={node.name} className="w-full h-full object-cover" />
          ) : (
            <span className={`text-lg font-bold ${isCurrentUser ? 'text-blue-700' : 'text-slate-700'}`}>
              {node.name ? node.name[0]?.toUpperCase() : "U"}
            </span>
          )}
        </div>

        {/* Info */}
        <h3 className="font-bold text-slate-900 text-sm truncate" title={node.name}>{node.name || "Unknown"}</h3>
        <p className="text-[11px] font-semibold text-blue-600 mt-1 flex items-center justify-center gap-1 truncate" title={profile.designation}>
          <Briefcase className="w-3 h-3 shrink-0" />
          <span className="truncate">{profile.designation || "Employee"}</span>
        </p>

        <div className="w-full border-t border-slate-100 my-3"></div>

        {/* Department */}
        <div className="text-[10px] font-medium text-slate-500 flex items-center justify-center gap-1 truncate" title={profile.department?.name}>
          <Building className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{profile.department?.name || "Corporate"}</span>
        </div>

        {/* Direct Reports Count Toggle */}
        {node.children && node.children.length > 0 && (
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-3 flex items-center justify-center gap-1 w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold transition-colors"
          >
            <User className="w-3 h-3" />
            {node.children.length} Reports
            {isExpanded ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </button>
        )}
      </div>

      {/* Children Sub-Tree */}
      {isExpanded && node.children && node.children.length > 0 && (
        <OrgChartChildren childrenNodes={node.children} currentUserEmail={currentUserEmail} />
      )}
    </li>
  );
}
