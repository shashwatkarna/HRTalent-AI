"use client";

import { useState } from "react";
import { LogIn, LogOut, Loader2 } from "lucide-react";
import { clockInAction, clockOutAction } from "./actions";

interface Props {
  employeeId: string;
  hasClockedIn: boolean;
  hasClockedOut: boolean;
  clockInTime: string | null;
  clockOutTime: string | null;
}

export default function ClockInClient({ employeeId, hasClockedIn, hasClockedOut, clockInTime, clockOutTime }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClockIn = async () => {
    setIsSubmitting(true);
    await clockInAction(employeeId);
    setIsSubmitting(false);
  };

  const handleClockOut = async () => {
    setIsSubmitting(true);
    await clockOutAction(employeeId);
    setIsSubmitting(false);
  };

  if (hasClockedOut) {
    return (
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="bg-emerald-500/20 text-emerald-400 px-6 py-3 rounded-xl font-bold border border-emerald-500/30 flex items-center gap-2">
          <LogOut className="w-5 h-5" /> Shift Complete
        </div>
        <div className="text-xs text-slate-400 mt-2 font-medium">
          In: {clockInTime} • Out: {clockOutTime}
        </div>
      </div>
    );
  }

  if (hasClockedIn) {
    return (
      <div className="flex flex-col items-center gap-4 relative z-10">
        <button 
          onClick={handleClockOut}
          disabled={isSubmitting}
          className="bg-rose-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-rose-600 transition-all shadow-lg hover:shadow-rose-500/25 flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5" />}
          Clock Out
        </button>
        <div className="text-xs text-slate-400 font-medium bg-slate-800/50 px-3 py-1.5 rounded-lg border border-slate-700/50">
          Clocked in at {clockInTime}
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={handleClockIn}
      disabled={isSubmitting}
      className="bg-indigo-500 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-indigo-600 transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 relative z-10 disabled:opacity-50"
    >
      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
      Clock In for Shift
    </button>
  );
}
