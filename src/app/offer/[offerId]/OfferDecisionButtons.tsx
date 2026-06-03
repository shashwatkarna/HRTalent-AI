"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { acceptOffer, rejectOffer } from "./actions";

export function OfferDecisionButtons({ offerId, candidateId }: { offerId: string, candidateId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  async function handleAccept() {
    setIsSubmitting(true);
    await acceptOffer(offerId, candidateId);
    router.refresh();
  }

  async function handleReject() {
    if (!confirm("Are you sure you want to reject this offer? This action cannot be undone.")) return;
    setIsSubmitting(true);
    await rejectOffer(offerId, candidateId);
    router.refresh();
  }

  return (
    <div className="flex gap-3 w-full sm:w-auto">
      <button 
        onClick={handleReject}
        disabled={isSubmitting}
        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 bg-white hover:bg-rose-50 text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg font-medium transition-colors disabled:opacity-50"
      >
        <X className="w-4 h-4" />
        Decline
      </button>
      <button 
        onClick={handleAccept}
        disabled={isSubmitting}
        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-8 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium transition-colors shadow-lg shadow-slate-900/20 disabled:opacity-50"
      >
        <Check className="w-4 h-4" />
        Accept Offer
      </button>
    </div>
  );
}
