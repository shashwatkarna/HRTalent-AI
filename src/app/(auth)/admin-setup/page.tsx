"use client";

import { useState } from "react";
import { setupAdmin } from "./actions";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Image from "next/image";

export default function AdminSetupPage() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    const result = await setupAdmin(formData);
    
    if (result?.error) {
      setError(result.error);
    } else if (result?.success) {
      setSuccess("Super Admin created successfully! You can now log in.");
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fc]">
      <div className="bg-white p-10 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md border border-slate-100">
        
        <div className="flex flex-col items-center justify-center mb-8 text-center">
          <div className="mb-4">
            <Image src="/logo.png" alt="AITalent HR Logo" width={48} height={48} className="object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Setup</h1>
          <p className="text-sm text-slate-500 mt-1">Create the initial Super Admin account. Do not share this link.</p>
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
            <div>
              <p className="font-semibold">{success}</p>
              <p className="mt-1">Go to <a href="/login" className="underline">/login</a></p>
            </div>
          </div>
        )}

        <form action={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Email</label>
            <input 
              name="email"
              type="email" 
              required
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              placeholder="admin@aitalent.com"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Secure Password</label>
            <input 
              name="password"
              type="password" 
              required
              minLength={6}
              className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoading || !!success}
            className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors mt-4 shadow-sm flex items-center justify-center"
          >
            {isLoading ? "Creating Admin..." : "Initialize Super Admin"}
          </button>
        </form>
      </div>
    </div>
  );
}
