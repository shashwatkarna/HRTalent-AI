"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { updateLeaveStatus } from "./actions";

export default function LeaveActionButtons({ leaveId }: { leaveId: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (status: "APPROVED" | "REJECTED") => {
    setIsLoading(true);
    await updateLeaveStatus(leaveId, status);
    setIsLoading(false);
  };

  return (
    <div className="flex gap-3 mt-auto pt-4 border-t border-slate-100">
      <button 
        onClick={() => handleAction("REJECTED")}
        disabled={isLoading}
        className="flex-1 py-2 px-4 border border-rose-200 text-rose-700 rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
      >
        <X className="w-4 h-4" /> Reject
      </button>
      <button 
        onClick={() => handleAction("APPROVED")}
        disabled={isLoading}
        className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50 shadow-sm shadow-emerald-200"
      >
        <Check className="w-4 h-4" /> Approve
      </button>
    </div>
  );
}
