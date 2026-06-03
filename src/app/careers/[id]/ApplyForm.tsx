"use client";

import { useState } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ApplyForm({ jobId }: { jobId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        setFile(null);
      } else {
        setError(null);
        setFile(selected);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobId", jobId);

    try {
      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-6 bg-emerald-50 rounded-lg border border-emerald-100">
        <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
        <h4 className="font-bold text-emerald-900 mb-1">Application Received</h4>
        <p className="text-sm text-emerald-700">
          Our AI recruiter has reviewed your profile. If there is a match, check your email for an interview invitation!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-50 text-rose-600 text-sm rounded-lg border border-rose-100">
          {error}
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Resume (PDF only)</label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-200 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-8 w-8 text-slate-400" />
            <div className="flex text-sm text-slate-600 justify-center">
              <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                <span>Upload a file</span>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} />
              </label>
            </div>
            <p className="text-xs text-slate-500">
              {file ? file.name : "PDF up to 5MB"}
            </p>
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!file || isSubmitting} 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-semibold h-11"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Profile...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}
