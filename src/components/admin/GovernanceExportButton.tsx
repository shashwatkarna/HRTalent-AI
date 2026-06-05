"use client";

import { Download } from "lucide-react";
import React from "react";

interface Props {
  evaluations: any[];
}

export default function GovernanceExportButton({ evaluations }: Props) {
  const handleExport = () => {
    // 1. Define CSV headers
    const headers = [
      "Candidate Name",
      "Applied Role",
      "Match Score",
      "Communication Score",
      "Technical Score",
      "AI Recommendation",
      "AI Summary",
      "Decision"
    ];

    // 2. Map data to rows
    const rows = evaluations.map((evalItem) => {
      const isAdvanced = (evalItem.matchScore || 0) >= 70;
      
      return [
        `"${evalItem.candidate?.name || 'Unknown'}"`,
        `"${evalItem.candidate?.jobPosting?.title || 'Unknown'}"`,
        evalItem.matchScore || 0,
        evalItem.communicationScore || 'N/A',
        evalItem.technicalScore || 'N/A',
        `"${(evalItem.finalRecommendation || '').replace(/"/g, '""')}"`,
        `"${(evalItem.aiSummary || '').replace(/"/g, '""')}"`,
        isAdvanced ? "ADVANCED" : "REJECTED"
      ];
    });

    // 3. Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    // 4. Create Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `ai_governance_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg"
    >
      <Download className="w-4 h-4" /> Export Report
    </button>
  );
}
