"use client";

import { useState } from "react";
import { Upload, FileText, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UploadResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async () => {
    if (!file || !jobId) {
      setError("Please select a job and a resume file.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResult(null);

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
        throw new Error(data.error || "Failed to process resume");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/hr" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Resume Screening</h1>
        <p className="text-slate-500 mt-1">Upload a candidate's resume (PDF). Gemini AI will parse, evaluate, and rank them instantly.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 space-y-6">
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">1. Target Job Posting ID</label>
          <input 
            type="text" 
            placeholder="Paste Job ID (e.g. cm46...)" 
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500" 
          />
          <p className="text-xs text-slate-500">You can copy a Job ID from the database or the URL.</p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-900">2. Upload Resume (PDF)</label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
            <input 
              type="file" 
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-8 h-8 text-indigo-500 mb-3" />
            <p className="text-sm font-medium text-slate-900">Click to browse or drag PDF here</p>
            {file && <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center"><FileText className="w-3 h-3 mr-1" /> {file.name}</p>}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg flex items-start text-sm">
            <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <Button 
          onClick={handleUpload} 
          disabled={!file || !jobId || isUploading}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isUploading ? "AI is Analyzing Resume..." : "Run AI Resume Screening"}
        </Button>
      </div>

      {result && (
        <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-emerald-900">AI Evaluation Complete!</h2>
          </div>
          <div className="bg-white p-4 rounded-xl border border-emerald-100">
            <p className="font-semibold text-slate-900">Candidate: {result.evaluation.name}</p>
            <p className="text-emerald-700 font-bold text-lg mt-2">Match Score: {result.evaluation.matchScore}%</p>
            <p className="text-slate-600 text-sm mt-2">{result.evaluation.aiSummary}</p>
            
            <div className="mt-4 flex gap-3">
              <Link href={`/hr/candidates/${result.candidateId}`}>
                <Button variant="outline" className="text-indigo-600 border-indigo-200">View Full Profile</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
