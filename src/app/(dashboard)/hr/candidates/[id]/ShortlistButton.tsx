"use client";

import { useState } from "react";
import { UserCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { shortlistCandidate } from "@/actions/candidate-actions";
import { useRouter } from "next/navigation";

export default function ShortlistButton({ candidateId }: { candidateId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleShortlist = async () => {
    setIsLoading(true);
    const result = await shortlistCandidate(candidateId);
    setIsLoading(false);
    
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to shortlist candidate");
    }
  };

  return (
    <Button 
      onClick={handleShortlist} 
      disabled={isLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-colors mt-4"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <UserCheck className="w-4 h-4 mr-2" />
      )}
      Shortlist for Manager
    </Button>
  );
}
