"use client";

import { useState } from "react";
import { clockIn, clockOut } from "./actions";
import { Loader2 } from "lucide-react";

export default function AttendanceClient({ clockInTime, clockOutTime }: { clockInTime: string | null, clockOutTime: string | null }) {
  const [loading, setLoading] = useState(false);

  const handleClockIn = async () => {
    setLoading(true);
    await clockIn();
    setLoading(false);
  };

  const handleClockOut = async () => {
    setLoading(true);
    await clockOut();
    setLoading(false);
  };

  if (clockInTime && clockOutTime) {
    return (
      <div className="w-full bg-slate-100 text-slate-500 font-semibold py-4 rounded-xl border border-slate-200 cursor-not-allowed">
        Shift Completed
      </div>
    );
  }

  if (clockInTime && !clockOutTime) {
    return (
      <button 
        onClick={handleClockOut}
        disabled={loading}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all flex justify-center items-center gap-2 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Clock Out"}
      </button>
    );
  }

  return (
    <button 
      onClick={handleClockIn}
      disabled={loading}
      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.3)] transition-all flex justify-center items-center gap-2 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Clock In"}
    </button>
  );
}
