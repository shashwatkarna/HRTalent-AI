import { Plus, Users, Brain, Activity, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { db } from "@/lib/prisma";

export default async function HRRecruiterDashboard() {
  // Fetch real data from the database
  const activeJobs = await db.jobPosting.findMany({
    where: { isActive: true },
    include: {
      _count: {
        select: { candidates: true }
      }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  const topCandidates = await db.candidate.findMany({
    where: { status: { in: ['SCREENED', 'INTERVIEWED'] } },
    include: { aiEvaluation: true, jobPosting: true },
    orderBy: { 
      aiEvaluation: { matchScore: 'desc' }
    },
    take: 5
  });

  const totalApplicants = await db.candidate.count();
  const aiScreenedCount = await db.candidate.count({ where: { status: 'SCREENED' } });
  const aiInterviewedCount = await db.candidate.count({ where: { status: 'INTERVIEWED' } });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Recruitment Command Center</h1>
          <p className="text-slate-500 mt-1">Manage job postings and review AI-ranked candidate pipelines.</p>
        </div>
        
        <Link href="/hr/jobs/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Create New Job Posting
          </Button>
        </Link>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Applicants</p>
            <p className="text-2xl font-bold text-slate-900">{totalApplicants}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Resumes AI-Screened</p>
            <p className="text-2xl font-bold text-slate-900">{aiScreenedCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">AI Interviews Conducted</p>
            <p className="text-2xl font-bold text-slate-900">{aiInterviewedCount}</p>
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
            {activeJobs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No active job postings yet.</div>
            ) : activeJobs.map((job) => (
              <div key={job.id} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                <div>
                  <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                </div>
                <div className="flex gap-4 items-center text-sm text-slate-500">
                  <div className="text-center">
                    <p className="font-bold text-slate-900">{job._count.candidates}</p>
                    <p className="text-xs">Applicants</p>
                  </div>
                  <Badge variant={job.isActive ? "default" : "secondary"}>
                    {job.isActive ? "Active" : "Draft"}
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
            {topCandidates.length === 0 ? (
               <div className="p-8 text-center text-slate-500">No AI-screened candidates yet.</div>
            ) : topCandidates.map((candidate) => (
              <Link href={`/hr/candidates/${candidate.id}`} key={candidate.id} className="p-6 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center group block">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{candidate.jobPosting?.title || "Unknown Role"}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Match</span>
                    <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 text-sm py-0.5">
                      {candidate.aiEvaluation?.matchScore || 0}%
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
