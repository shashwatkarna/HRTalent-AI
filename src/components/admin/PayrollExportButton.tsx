"use client";

import { Download } from "lucide-react";
import React from "react";

interface Props {
  employees: any[];
}

export default function PayrollExportButton({ employees }: Props) {
  const handleExport = () => {
    // 1. Define CSV headers
    const headers = [
      "Employee Name",
      "Designation",
      "Department",
      "Base Salary (Annual)",
      "Gross Monthly Run Rate",
      "Estimated Net Monthly"
    ];

    // 2. Map data to rows
    const rows = employees.map((emp) => {
      const base = emp.salary || 0;
      const monthly = base / 12;
      const net = monthly + (monthly * 0.05) - (monthly * 0.12);

      return [
        `"${emp.user?.name || 'Unknown'}"`,
        `"${emp.designation || 'Unknown'}"`,
        `"${emp.department?.name || 'Unassigned'}"`,
        base.toFixed(2),
        monthly.toFixed(2),
        net.toFixed(2)
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
    link.setAttribute("download", `global_payroll_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg"
    >
      <Download className="w-4 h-4" /> Export CSV
    </button>
  );
}
