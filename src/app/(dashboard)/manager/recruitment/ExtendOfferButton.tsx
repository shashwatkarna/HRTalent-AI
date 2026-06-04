"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { extendOfferAction } from "./actions";

interface Props {
  candidateId: string;
  candidateEmail: string;
  currentStatus: string;
}

export default function ExtendOfferButton({ candidateId, candidateEmail, currentStatus }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (currentStatus === "HIRED") {
    return (
      <button disabled className="flex-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg px-4 py-2 font-medium flex items-center justify-center gap-2 cursor-not-allowed">
        <CheckCircle2 className="w-4 h-4" /> Offer Extended
      </button>
    );
  }

  const handleApprove = async () => {
    setIsSubmitting(true);
    setError(null);

    const res = await extendOfferAction(candidateId, candidateEmail);
    
    if (!res.success) {
      setError(res.error || "Failed to extend offer");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <button 
        onClick={handleApprove}
        disabled={isSubmitting}
        className="w-full bg-slate-900 text-white rounded-lg px-4 py-2 font-medium hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Extend Offer & Onboard"}
      </button>
      {error && <span className="text-xs text-rose-500 mt-1 text-center">{error}</span>}
    </div>
  );
}
