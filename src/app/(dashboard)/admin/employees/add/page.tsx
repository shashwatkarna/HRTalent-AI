"use client";

import { useState } from "react";
import { addEmployee } from "../actions";
import { UserPlus, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AddEmployeePage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const result = await addEmployee(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess("Employee account successfully provisioned!");
    }
    
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin/employees">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Provision New Employee</h1>
          <p className="text-slate-500 text-sm mt-1">Create a new secure account in the system.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900">Account Details</h2>
            <p className="text-xs text-slate-500">This will silently create an active session for the employee.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3 text-emerald-700 text-sm">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input 
                name="name"
                type="text" 
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Sarah Connor"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">System Role</label>
              <select 
                name="role"
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_RECRUITER">HR Recruiter</option>
                <option value="SENIOR_MANAGER">Senior Manager</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="sarah@aitalent.com"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Temporary Password</label>
              <input 
                name="password"
                type="password" 
                required
                minLength={6}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          </div>
          
          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-6">
            <Link href="/admin/employees">
              <Button type="button" variant="outline" className="px-6">Cancel</Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isLoading || !!success}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8"
            >
              {isLoading ? "Provisioning..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
