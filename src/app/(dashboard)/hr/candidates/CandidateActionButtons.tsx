"use client";

import { useState } from "react";
import { Link2, Copy, CheckCircle2, ChevronRight, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCandidateStatus } from "./actions";
import { sendInterviewInvite } from "@/app/actions/email";
import Link from "next/link";

interface Props {
  candidateId: string;
  status: string;
  candidateEmail?: string;
  candidateName?: string;
}

export function CandidateActionButtons({ candidateId, status, candidateEmail, candidateName }: Props) {
  const [copied, setCopied] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the subdomain structure for the interview app
  const interviewLink = `http://interview.localhost:3000/${candidateId}`;

  const handleGenerateAndSend = async () => {
    setIsSending(true);
    // 1. Update status
    await updateCandidateStatus(candidateId, "SCREENED");
    
    // 2. Send Email
    if (candidateEmail && candidateName) {
      const res = await sendInterviewInvite(candidateId, candidateEmail, candidateName);
      if (res.success) {
        setSent(true);
        setTimeout(() => setSent(false), 4000);
      } else {
        alert(`Email failed to send: ${res.error}`);
      }
    }
    
    setIsSending(false);
  };

  const handleCopyLink = async () => {
    setIsGenerating(true);
    await updateCandidateStatus(candidateId, "SCREENED");
    try {
      await navigator.clipboard.writeText(interviewLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
    setIsGenerating(false);
  };

  if (status === "APPLIED" || status === "SCREENED") {
    return (
      <div className="flex items-center justify-end gap-2">
        <Button 
          onClick={handleCopyLink}
          disabled={isGenerating}
          size="sm" 
          variant="outline"
          className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white"
        >
          {copied ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
          {copied ? "Copied!" : "Copy Link"}
        </Button>
        <Button 
          onClick={handleGenerateAndSend} 
          disabled={isSending || sent}
          size="sm" 
          className={sent ? "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100" : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"}
        >
          {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 
           sent ? <CheckCircle2 className="w-4 h-4 mr-2" /> : 
           <Mail className="w-4 h-4 mr-2" />}
          {isSending ? "Sending..." : sent ? "Invite Sent!" : "Email Invite"}
        </Button>
      </div>
    );
  }

  // If INTERVIEWED or beyond, show Review button
  return (
    <Link href={`/hr/candidates/${candidateId}`}>
      <Button 
        size="sm" 
        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
      >
        Review AI Interview <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </Link>
  );
}
