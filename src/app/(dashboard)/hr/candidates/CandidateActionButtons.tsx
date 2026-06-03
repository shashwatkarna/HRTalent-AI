"use client";

import { useState } from "react";
import { Link2, Copy, CheckCircle2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updateCandidateStatus } from "./actions";
import Link from "next/link";

export function CandidateActionButtons({ candidateId, status }: { candidateId: string, status: string }) {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use the new subdomain structure
  const interviewLink = `http://interview.localhost:3000/${candidateId}`;

  const handleGenerateLink = async () => {
    setIsGenerating(true);
    // Move status from APPLIED to SCREENED (which we treat as Interview Scheduled for hackathon)
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

  if (status === "APPLIED") {
    return (
      <Button 
        onClick={handleGenerateLink} 
        disabled={isGenerating}
        size="sm" 
        className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 border-none font-semibold"
      >
        <Link2 className="w-4 h-4 mr-2" /> Invite to AI Voice Interview
      </Button>
    );
  }

  if (status === "SCREENED") {
    return (
      <Button 
        onClick={handleGenerateLink}
        size="sm" 
        variant="outline"
        className="border-indigo-200 text-indigo-600 hover:bg-indigo-50 bg-white"
      >
        {copied ? <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
        {copied ? "Link Copied!" : "Copy Interview Link"}
      </Button>
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
