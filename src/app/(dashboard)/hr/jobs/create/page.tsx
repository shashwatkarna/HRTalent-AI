import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateJobPostingPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link href="/hr" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Dashboard
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create Job Posting</h1>
        <p className="text-slate-500 mt-1">Define the role requirements. Our AI will use this to evaluate and rank incoming resumes.</p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Job Title</label>
              <Input placeholder="e.g. Senior AI Engineer" className="w-full" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-900">Department</label>
              <select className="w-full h-10 px-3 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                <option>Engineering</option>
                <option>Marketing</option>
                <option>Human Resources</option>
                <option>Sales</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Job Description (Used by AI Engine)</label>
            <p className="text-xs text-slate-500 pb-1">Be as detailed as possible. The AI will extract requirements from this text.</p>
            <textarea 
              rows={8}
              className="w-full p-4 rounded-md border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
              placeholder="Enter the full job description, responsibilities, and qualifications..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-900">Mandatory Skills (Comma separated)</label>
            <Input placeholder="e.g. Python, PyTorch, React, SQL" className="w-full" />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
            <Button variant="outline" type="button">Cancel</Button>
            <Button type="button" className="bg-indigo-600 hover:bg-indigo-700">
              <Save className="w-4 h-4 mr-2" /> Publish Job
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
