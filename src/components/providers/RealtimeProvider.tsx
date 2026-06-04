"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function RealtimeProvider({ children, role }: { children: React.ReactNode, role: string }) {
  const router = useRouter();

  useEffect(() => {
    // Only HR and Managers really need to be notified about candidate interviews
    if (role !== "HR_RECRUITER" && role !== "SENIOR_MANAGER" && role !== "MANAGEMENT") {
      return;
    }

    const supabase = createClient();
    
    // Create a channel that listens for updates to the Candidate table
    const channel = supabase
      .channel('candidate-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'Candidate',
        },
        (payload) => {
          const newRow = payload.new as any;
          const oldRow = payload.old as any;
          
          // Check if status specifically changed to INTERVIEWED
          if (newRow.status === 'INTERVIEWED' && oldRow.status !== 'INTERVIEWED') {
            toast.success(`Candidate ${newRow.name} just completed their AI Interview!`, {
              description: "Review their AI Scorecard now.",
              action: {
                label: "Review",
                onClick: () => router.push(`/hr/candidates/${newRow.id}`),
              },
              duration: 8000,
            });
            // Refresh the current route to fetch new data
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [role, router]);

  return <>{children}</>;
}
