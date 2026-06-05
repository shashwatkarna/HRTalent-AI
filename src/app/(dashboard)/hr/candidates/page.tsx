import { db } from "@/lib/prisma";
import { Plus, Search, User, Mail, Briefcase, CalendarClock, Bot, ChevronRight, PlayCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { AddCandidateForm } from "./AddCandidateForm";
import { CandidateActionButtons } from "./CandidateActionButtons";
import { ClientSearch } from "@/components/ui/ClientSearch";
import { ExportButtons } from "@/components/ui/ExportButtons";

export default async function CandidatesPipelinePage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  const candidates = await db.candidate.findMany({
    where: query ? {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
        { jobPosting: { title: { contains: query, mode: "insensitive" } } }
      ]
    } : undefined,
    include: { 
      jobPosting: true,
      aiEvaluation: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Talent Acquisition</h1>
          <p className="text-slate-500 mt-1">Manage applicants, schedule AI interviews, and review results.</p>
        </div>
        {/* We extract the form to a Client Component for interactivity */}
        <div className="flex items-center gap-3">
          <ExportButtons elementId="candidates-pipeline-table" filename="AITalent_Candidates_Pipeline" />
          <AddCandidateForm />
        </div>
      </div>

      <div id="candidates-pipeline-table" className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <ClientSearch placeholder="Search candidates or roles..." />
          <div className="text-sm text-slate-500 font-medium">
            Total Candidates: {candidates.length}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Applied Role</th>
                <th className="px-6 py-4">Pipeline Status</th>
                <th className="px-6 py-4">AI Match</th>
                <th className="px-6 py-4 text-right">Interview Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                        {candidate.name[0].toUpperCase()}
                      </div>
                      <div>
                        <Link href={`/hr/candidates/${candidate.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                          {candidate.name}
                        </Link>
                        <div className="text-slate-500 text-xs flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3" /> {candidate.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {candidate.jobPosting?.title || "Unknown Role"}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      candidate.status === 'APPLIED' ? 'secondary' :
                      candidate.status === 'SCREENED' ? 'default' :
                      candidate.status === 'INTERVIEWED' ? 'default' :
                      'outline'
                    } className={
                      candidate.status === 'INTERVIEWED' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-transparent' : 
                      candidate.status === 'APPLIED' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 border-transparent' : ''
                    }>
                      {candidate.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-100 rounded-full h-2 max-w-[80px]">
                        <div 
                          className={`h-2 rounded-full ${
                            (candidate.aiEvaluation?.matchScore || 0) > 80 ? 'bg-emerald-500' : 
                            (candidate.aiEvaluation?.matchScore || 0) > 50 ? 'bg-amber-500' : 'bg-rose-500'
                          }`}
                          style={{ width: `${candidate.aiEvaluation?.matchScore || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-bold text-slate-700">{candidate.aiEvaluation?.matchScore || 0}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                     {/* Extracted to Client Component to handle copying links to clipboard */}
                     <CandidateActionButtons 
                        candidateId={candidate.id} 
                        status={candidate.status} 
                        candidateEmail={candidate.email}
                        candidateName={candidate.name}
                     />
                  </td>
                </tr>
              ))}
              
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <User className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="font-medium text-slate-900">No candidates found.</p>
                      <p className="text-sm mt-1">Add a candidate to begin the AI recruitment pipeline.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
