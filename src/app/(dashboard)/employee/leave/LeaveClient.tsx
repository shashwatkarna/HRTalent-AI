"use client";

import { useState } from "react";
import { submitLeaveRequest } from "./actions";
import { Loader2, Plus } from "lucide-react";

export default function LeaveClient() {
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    
    const formData = new FormData(e.currentTarget);
    const result = await submitLeaveRequest(formData);
    
    if (result.error) {
      setMessage(result.error);
    } else {
      setIsOpen(false);
      setMessage("");
    }
    
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
      >
        <Plus className="w-5 h-5" /> Request Time Off
      </button>
    );
  }

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-6 relative animate-in fade-in slide-in-from-top-4">
      <h3 className="font-bold text-slate-900 mb-4 text-lg">New Leave Request</h3>
      
      {message && <div className="mb-4 text-red-600 text-sm font-medium">{message}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Leave Type</label>
            <select name="type" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="VACATION">Vacation</option>
              <option value="SICK">Sick Leave</option>
              <option value="PERSONAL">Personal Day</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input type="date" name="startDate" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input type="date" name="endDate" required className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
          <textarea name="reason" rows={3} className="w-full border border-slate-200 rounded-lg p-2.5 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"></textarea>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button 
            type="button" 
            onClick={() => setIsOpen(false)}
            className="px-5 py-2.5 text-slate-600 font-medium hover:bg-slate-200 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center justify-center min-w-[120px] transition-colors disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
