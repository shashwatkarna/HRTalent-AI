"use client";

import { useState, useTransition } from "react";
import { updateLeaveStatus } from "../actions";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LeaveApprovalButtons({ leaveRequestId }: { leaveRequestId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAction = (status: "APPROVED" | "REJECTED") => {
    setError("");
    startTransition(async () => {
      const res = await updateLeaveStatus(leaveRequestId, status);
      if (res.error) {
        setError(res.error);
      } else {
        router.refresh();
      }
    });
  };

  if (isPending) {
    return (
      <div className="flex justify-end pr-4">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <button 
        onClick={() => handleAction("APPROVED")}
        className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded transition-colors"
      >
        Approve
      </button>
      <button 
        onClick={() => handleAction("REJECTED")}
        className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded transition-colors"
      >
        Reject
      </button>
      {error && <span className="text-[10px] text-rose-600 font-semibold">{error}</span>}
    </div>
  );
}
