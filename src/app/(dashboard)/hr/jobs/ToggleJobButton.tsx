"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Power, PowerOff, Loader2 } from "lucide-react";
import { toggleJobStatus } from "@/actions/job-actions";
import { useRouter } from "next/navigation";

export function ToggleJobButton({ jobId, isActive }: { jobId: string, isActive: boolean }) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleToggle = async () => {
    setIsLoading(true);
    const result = await toggleJobStatus(jobId, isActive);
    setIsLoading(false);
    
    if (result.success) {
      router.refresh();
    } else {
      alert("Failed to update job status.");
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleToggle}
      disabled={isLoading}
      className={isActive 
        ? "text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700" 
        : "text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      }
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
      ) : isActive ? (
        <PowerOff className="w-3.5 h-3.5 mr-1.5" />
      ) : (
        <Power className="w-3.5 h-3.5 mr-1.5" />
      )}
      {isActive ? "Close Job" : "Reopen Job"}
    </Button>
  );
}
