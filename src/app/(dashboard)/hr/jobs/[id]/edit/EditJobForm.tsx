"use client";

import { useState } from "react";
import { ArrowLeft, Save, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateJobPosting } from "@/actions/job-actions";

type JobProps = {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
};

export default function EditJobForm({ job }: { job: JobProps }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  
  const [formData, setFormData] = useState({
    title: job.title,
    description: job.description,
    skills: job.requiredSkills.join(", ")
  });

  // Reusing the AI generator logic to enhance descriptions
  const handleGenerate = async () => {
    if (!prompt) {
      alert("Please enter a short description for the AI to generate from.");
      return;
    }
    
    setIsGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      
      if (!res.ok) throw new Error("Failed to generate JD");
      
      const data = await res.json();
      setFormData({
        title: data.title || formData.title, // keep existing if not updated
        description: data.description || "",
        skills: data.skills || formData.skills
      });
    } catch (err) {
      console.error(err);
      alert("Failed to generate Job Description. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Bind the jobId to the server action
  const formActionWithId = updateJobPosting.bind(null, job.id);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/hr/jobs" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Jobs
      </Link>

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Edit Job Posting</h1>
          <p className="text-slate-500 mt-1">Update the role requirements. Note: Only new candidates will be evaluated against these changes.</p>
        </div>
      </div>
      
      {/* AI Generator Box (Optional Enhancement Tool) */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="bg-indigo-100 p-3 rounded-full shrink-0">
          <Sparkles className="w-6 h-6 text-indigo-600" />
        </div>
        <div className="flex-1 w-full">
          <h3 className="font-semibold text-indigo-900 mb-1">Rewrite with AI Job Description Generator</h3>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Add 2 years of React experience..." 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="bg-white border-indigo-200"
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
            />
            <Button 
              type="button"
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 whitespace-nowrap"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Enhance"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <form action={formActionWithId} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Job Title</label>
            <Input 
              name="title" 
              required 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Senior AI Engineer" 
              className="w-full" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Job Description</label>
            <p className="text-xs text-slate-500 pb-1">This text is directly used by the AI engine to evaluate resumes.</p>
            <textarea 
              name="description"
              required
              rows={12}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full p-4 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              placeholder="Enter the full job description, responsibilities, and qualifications..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Mandatory Skills (Comma separated)</label>
            <Input 
              name="skills" 
              required 
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
              placeholder="e.g. Python, PyTorch, React, SQL" 
              className="w-full" 
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Link href="/hr/jobs">
              <Button type="button" variant="outline" className="border-slate-200 text-slate-700">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
