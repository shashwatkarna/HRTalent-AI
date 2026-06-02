"use client";

import { useState } from "react";
import { UserPlus, ShieldAlert, KeyRound, Mail, UserCircle } from "lucide-react";
import { provisionEmployee } from "./actions";

export default function AddEmployeePage() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await provisionEmployee(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Provision New Account</h1>
        <p className="text-slate-500 mt-1">Create a secure system account for a new employee.</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-blue-900">Access Governance</h3>
          <p className="text-sm text-blue-800 mt-1">
            Accounts created here bypass public signups and are immediately injected into the Supabase Auth system and Prisma Database. Ensure roles are assigned correctly.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
            <UserPlus className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Account Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Full Name</label>
              <div className="relative">
                <UserCircle className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  name="name"
                  required
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Work Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="email" 
                  name="email"
                  required
                  placeholder="jane@aitalent.com"
                  className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Temporary Password</label>
            <div className="relative">
              <KeyRound className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="password" 
                name="password"
                required
                placeholder="Must be at least 6 characters"
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">System Role Assignment</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input type="radio" name="role" value="EMPLOYEE" defaultChecked className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Employee</div>
                  <div className="text-xs text-slate-500 mt-0.5">Standard access to personal dashboard and HR AI.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input type="radio" name="role" value="HR_RECRUITER" className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">HR Recruiter</div>
                  <div className="text-xs text-slate-500 mt-0.5">Access to Candidate Pipelines and AI interview tools.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50">
                <input type="radio" name="role" value="SENIOR_MANAGER" className="w-4 h-4 text-blue-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Senior Manager</div>
                  <div className="text-xs text-slate-500 mt-0.5">Access to department metrics and hiring approvals.</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-50 transition-colors has-[:checked]:border-amber-500 has-[:checked]:bg-amber-100">
                <input type="radio" name="role" value="ADMIN" className="w-4 h-4 text-amber-600" />
                <div>
                  <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">Management Admin <ShieldAlert className="w-3 h-3 text-amber-600" /></div>
                  <div className="text-xs text-slate-500 mt-0.5">Full root access to all system data and provisioning.</div>
                </div>
              </label>

            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold h-12 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoading ? "Provisioning Account..." : "Create Account & Grant Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
