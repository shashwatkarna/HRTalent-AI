"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, X, Loader2, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AddCandidateForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/ai/parse-resume", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.error) {
        alert(data.error);
        setIsUploading(false);
        return;
      }

      setSuccess(true);
      // Wait a moment then refresh the page to show the new candidate in the table
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      alert("Failed to upload and parse resume.");
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
        <UploadCloud className="w-4 h-4 mr-2" /> Upload Resume (AI Parse)
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => { setIsOpen(false); setFile(null); setSuccess(false); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {success ? <FileCheck className="w-8 h-8 text-emerald-500" /> : <FileText className="w-8 h-8" />}
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {success ? "Resume Parsed Successfully!" : "AI Resume Parsing"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {success ? "Candidate added to pipeline." : "Upload a PDF resume. The AI will extract their name, email, and top skills automatically."}
              </p>
            </div>

            {!success && (
              <div className="space-y-4">
                <div 
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-indigo-400 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 bg-slate-50'}`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                  {file ? (
                    <div className="flex flex-col items-center">
                      <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                      <p className="font-semibold text-slate-900 text-sm truncate w-full max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center cursor-pointer">
                      <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                      <p className="font-semibold text-slate-700 text-sm">Click to select PDF</p>
                      <p className="text-xs text-slate-500 mt-1">Max file size: 5MB</p>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={handleUpload} 
                  disabled={!file || isUploading} 
                  className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base shadow-md"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" /> Parsing Resume...
                    </>
                  ) : (
                    "Extract Data & Add Candidate"
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
