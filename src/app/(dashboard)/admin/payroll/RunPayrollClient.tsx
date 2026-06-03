"use client";

import { useState } from "react";
import { Calculator, CheckCircle2 } from "lucide-react";
import { runMonthlyPayroll } from "./actions";

interface Props {
  currentMonth: string;
  isAlreadyRun: boolean;
}

export default function RunPayrollClient({ currentMonth, isAlreadyRun }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRunPayroll = async () => {
    if (!confirm(`Are you sure you want to process payroll for ${currentMonth}? This action will generate payslips for all active employees and cannot be undone.`)) {
      return;
    }

    setIsSubmitting(true);
    const res = await runMonthlyPayroll(currentMonth);
    
    if (!res.success) {
      alert("Failed to run payroll: " + res.error);
    }
    setIsSubmitting(false);
  };

  if (isAlreadyRun) {
    return (
      <div className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-xl font-semibold border border-emerald-200 flex items-center gap-2 shadow-sm">
        <CheckCircle2 className="w-5 h-5" />
        Payroll Complete for {currentMonth}
      </div>
    );
  }

  return (
    <button 
      onClick={handleRunPayroll}
      disabled={isSubmitting}
      className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Calculator className="w-5 h-5" />
      {isSubmitting ? "Processing..." : `Run Payroll (${currentMonth})`}
    </button>
  );
}
