"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { sendInterviewInvite } from "@/app/actions/email";

interface Props {
  candidateId: string;
  candidateEmail: string;
  candidateName: string;
}

export default function SendInviteButton({ candidateId, candidateEmail, candidateName }: Props) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    setIsSending(true);
    setError(null);
    const res = await sendInterviewInvite(candidateId, candidateEmail, candidateName);
    
    if (res.success) {
      setSent(true);
    } else {
      setError(res.error || "Failed to send email");
    }
    setIsSending(false);
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-emerald-50 rounded-xl border border-emerald-100 mt-4">
        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
        <h4 className="font-bold text-emerald-900">Invite Sent Successfully!</h4>
        <p className="text-sm text-emerald-700 text-center mt-1">
          An email has been dispatched to {candidateEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-col items-center">
      <button 
        onClick={handleSend}
        disabled={isSending}
        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50"
      >
        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
        {isSending ? "Sending Invite..." : "Send AI Interview Invite via Email"}
      </button>
      {error && <p className="text-rose-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
