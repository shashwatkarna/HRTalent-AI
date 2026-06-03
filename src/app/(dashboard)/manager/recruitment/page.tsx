import { db } from "@/lib/prisma";
import { CheckCircle2, FileText, UserPlus, BrainCircuit, ExternalLink, Search } from "lucide-react";
import Link from "next/link";

export default async function ManagerRecruitmentPage() {
  // Fetch candidates who have made it to the final stages of the funnel
  const shortlistedCandidates = await db.candidate.findMany({
    where: {
      status: {
        in: ["SELECTED", "HIRED"]
      }
    },
    include: {
      jobPosting: true,
      aiEvaluation: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Shortlisted Candidates</h1>
          <p className="text-slate-500 mt-2">Review top talent approved by HR and their AI Evaluation scores.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {shortlistedCandidates.map((candidate) => (
          <div key={candidate.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{candidate.name}</h3>
                  <p className="text-sm font-medium text-blue-600">{candidate.jobPosting.title}</p>
                </div>
              </div>
              
              <div className="text-right flex flex-col items-end">
                {candidate.status === 'HIRED' ? (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Hired
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-indigo-200">
                    Pending Final Review
                  </span>
                )}
                <span className="text-xs text-slate-500 mt-2">{candidate.email}</span>
              </div>
            </div>

            {candidate.aiEvaluation ? (
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">AI Match Score</span>
                    <span className="text-2xl font-black text-indigo-600">{candidate.aiEvaluation.matchScore || '--'}/100</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex flex-col justify-center items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Recommendation</span>
                    <span className="text-sm font-bold text-emerald-600 text-center">{candidate.aiEvaluation.finalRecommendation || 'Recommended'}</span>
                  </div>
                </div>

                <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <BrainCircuit className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-semibold text-slate-900">AI Summary</h4>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {candidate.aiEvaluation.aiSummary || "No AI summary generated for this candidate."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center p-8 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                <p className="text-sm text-slate-500">No AI evaluation data available.</p>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-slate-100 flex gap-3">
              <button className="flex-1 bg-slate-900 text-white rounded-lg px-4 py-2 font-medium hover:bg-slate-800 transition-colors shadow-sm">
                Extend Offer
              </button>
              <button className="flex-1 bg-white border border-slate-200 text-slate-700 rounded-lg px-4 py-2 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                View Resume
              </button>
            </div>
          </div>
        ))}

        {shortlistedCandidates.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center">
            <Search className="w-12 h-12 text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">No shortlisted candidates yet</h3>
            <p className="text-slate-500">Candidates selected by HR will appear here for your final review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
