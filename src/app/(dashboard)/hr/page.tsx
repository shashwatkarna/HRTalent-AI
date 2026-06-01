import { Plus, Users, Brain, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock Data for Job Postings
const mockJobs = [
  { id: "JOB-001", title: "Senior AI Engineer", department: "Engineering", applicants: 45, aiScreened: 45, status: "Active" },
  { id: "JOB-002", title: "Product Marketing Manager", department: "Marketing", applicants: 12, aiScreened: 12, status: "Active" },
  { id: "JOB-003", title: "HR Business Partner", department: "Human Resources", applicants: 8, aiScreened: 8, status: "Draft" },
];

// Mock Data for Top Ranked Candidates
const topCandidates = [
  { id: "CAN-101", name: "David Chen", role: "Senior AI Engineer", matchScore: 94, status: "AI_SCREENED" },
  { id: "CAN-102", name: "Sarah Williams", role: "Senior AI Engineer", matchScore: 89, status: "AI_INTERVIEWED" },
  { id: "CAN-103", name: "Michael Ross", role: "Product Marketing Manager", matchScore: 91, status: "AI_SCREENED" },
];

export default function HRRecruiterDashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Recruitment Command Center</h1>
          <p className="text-slate-500 mt-1">Manage job postings and review AI-ranked candidate pipelines.</p>
        </div>
        
        <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Create New Job Posting
        </Button>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Applicants</p>
            <p className="text-2xl font-bold text-slate-900">65</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Resumes AI-Screened</p>
            <p className="text-2xl font-bold text-slate-900">65</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">AI Interviews Conducted</p>
            <p className="text-2xl font-bold text-slate-900">14</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Job Postings */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Active Job Postings</h2>
            <Link href="/hr/jobs" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {mockJobs.map((job) => (
              <div key={job.id} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{job.department}</p>
                </div>
                <div className="flex gap-4 items-center text-sm text-slate-500">
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{job.applicants}</p>
                    <p className="text-xs">Applicants</p>
                  </div>
                  <Badge variant={job.status === "Active" ? "default" : "secondary"}>
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Ranked Candidates (AI Pipeline) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-900">Top Ranked Candidates</h2>
            <Link href="/hr/candidates" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center">
              View Pipeline <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="p-0 flex-1">
            {topCandidates.map((candidate) => (
              <Link href={`/hr/candidates/${candidate.id}`} key={candidate.id} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center group block">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{candidate.role}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Match</span>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-sm py-0.5">
                      {candidate.matchScore}%
                    </Badge>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">{candidate.status.replace("_", " ")}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
