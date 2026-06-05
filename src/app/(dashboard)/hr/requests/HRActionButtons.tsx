"use client";

import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { approveTerminationRequest, rejectTerminationRequest } from "./actions";

export default function HRActionButtons({ requestId, targetUserId, targetUserEmail }: { requestId: string, targetUserId: string, targetUserEmail: string }) {
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    const confirm = window.confirm(`WARNING: This will permanently delete the employee ${targetUserEmail} from the system. Are you sure?`);
    if (!confirm) return;

    setIsLoading(true);
    const res = await approveTerminationRequest(requestId, targetUserId, targetUserEmail);
    setIsLoading(false);
    if (res?.error) alert(res.error);
  };

  const handleReject = async () => {
    setIsLoading(true);
    const res = await rejectTerminationRequest(requestId);
    setIsLoading(false);
    if (res?.error) alert(res.error);
  };

  return (
    <div className="flex gap-2">
      <button 
        onClick={handleReject}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" /> Reject
      </button>
      <button 
        onClick={handleApprove}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-sm transition-colors disabled:opacity-50"
      >
        <Check className="w-4 h-4" /> Approve & Terminate
      </button>
    </div>
  );
}
