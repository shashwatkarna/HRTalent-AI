import { db } from "@/lib/prisma";
import { Search, User, PlayCircle, Bot, Mic, FileText, CheckCircle2, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function VoiceInterviewsDashboard() {
  // Fetch candidates who have an AI Evaluation (meaning they completed or started the interview)
  const candidates = await db.candidate.findMany({
    where: {
      aiEvaluation: {
        isNot: null
      }
    },
    include: { 
      jobPosting: true,
      aiEvaluation: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Mic className="w-6 h-6 text-indigo-600" />
            Voice Interviews
          </h1>
          <p className="text-slate-500 mt-1">Review AI evaluations, technical scores, and transcripts for completed voice interviews.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search interviews..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Completed Interviews: {candidates.filter(c => c.status === 'INTERVIEWED' || c.status === 'SELECTED' || c.status === 'HIRED').length}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Applied Role</th>
                <th className="px-6 py-4">AI Recommendation</th>
                <th className="px-6 py-4">Evaluation Scores</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((candidate) => {
                const evalData = candidate.aiEvaluation;
                const isComplete = !!evalData?.communicationScore;
                
                return (
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
                          <div className="text-slate-500 text-xs mt-0.5">
                            ID: {candidate.id.slice(-6).toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {candidate.jobPosting?.title || "Unknown Role"}
                    </td>

                    <td className="px-6 py-4">
                      {isComplete ? (
                        <div className="flex flex-col gap-1 items-start">
                          <Badge variant="outline" className={
                            evalData.finalRecommendation?.includes("Strongly") ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                            evalData.finalRecommendation?.includes("Not") ? "bg-rose-50 text-rose-700 border-rose-200" :
                            "bg-amber-50 text-amber-700 border-amber-200"
                          }>
                            {evalData.finalRecommendation || "Pending"}
                          </Badge>
                          <span className="text-xs text-slate-500 max-w-[200px] truncate" title={evalData.aiSummary || ""}>
                            {evalData.aiSummary || "No summary provided."}
                          </span>
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500">Incomplete</Badge>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {isComplete ? (
                        <div className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-500">Tech</span>
                            <span className="font-bold text-slate-800">{evalData.technicalScore}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-500">Comm</span>
                            <span className="font-bold text-slate-800">{evalData.communicationScore}%</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-xs text-slate-500">Conf</span>
                            <span className="font-bold text-slate-800">{evalData.confidenceScore}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Waiting for interview...</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {isComplete ? (
                        <Link href={`/hr/candidates/${candidate.id}`}>
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium transition-colors ml-auto">
                            <FileText className="w-3.5 h-3.5" />
                            Transcript
                          </button>
                        </Link>
                      ) : (
                        <span className="text-slate-400 text-xs italic">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Bot className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="font-medium text-slate-900">No AI Interviews yet.</p>
                      <p className="text-sm mt-1">Candidates will appear here after taking the AI Voice Interview.</p>
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
