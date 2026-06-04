"use client";

import { useState } from "react";
import { submitLeaveRequest } from "./actions";
import { Loader2 } from "lucide-react";

export default function LeaveRequestForm({ employeeId }: { employeeId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const res = await submitLeaveRequest(employeeId, formData);
    
    if (!res.success) {
      setError(res.error || "Failed to submit request.");
      setIsSubmitting(false);
    } else {
      // Success, form will reset via revalidatePath
      setIsSubmitting(false);
      (e.target as HTMLFormElement).reset();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-rose-500 bg-rose-50 p-3 rounded-lg">{error}</div>}
      
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Leave Type</label>
        <select name="type" required className="w-full border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none">
          <option value="VACATION">Annual Leave</option>
          <option value="SICK">Sick Leave</option>
          <option value="PERSONAL">Personal Leave</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Start Date</label>
          <input type="date" name="startDate" required className="w-full border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">End Date</label>
          <input type="date" name="endDate" required className="w-full border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">Reason (Optional)</label>
        <textarea name="reason" rows={3} placeholder="Please provide any relevant details..." className="w-full border-slate-200 rounded-xl px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none resize-none"></textarea>
      </div>

      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center disabled:opacity-50"
      >
        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
      </button>
    </form>
  );
}
