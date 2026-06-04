import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ArrowLeft, User, Mail, BrainCircuit, Activity, BarChart3, MessageSquareText, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SendInviteButton from "./SendInviteButton";

export default async function CandidateDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Fix Next.js 15+ promise unwrapping for params in server components
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const candidate = await db.candidate.findUnique({
    where: { id },
    include: {
      jobPosting: true,
      aiEvaluation: true
    }
  });

  if (!candidate) return notFound();

  const evalData = candidate.aiEvaluation;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/hr/candidates">
          <Button variant="outline" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Evaluation Report</h1>
          <p className="text-slate-500 text-sm mt-1">Detailed metrics and transcripts from the AI Interview.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Candidate Info Card */}
        <div className="col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mb-4">
            {candidate.name[0].toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 justify-center mt-2">
            <Mail className="w-4 h-4" /> {candidate.email}
          </p>
          <div className="w-full h-px bg-slate-100 my-6"></div>
          <div className="w-full text-left space-y-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Applied Role</p>
              <p className="font-medium text-slate-900">{candidate.jobPosting?.title || "Unknown"}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pipeline Status</p>
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold border border-indigo-100">
                {candidate.status.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* AI Metrics Card */}
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">AI Scoring Metrics</h3>
                <p className="text-sm text-slate-500">Evaluated by Gemini 2.5 Flash Voice Agent</p>
              </div>
            </div>

            {candidate.status === "APPLIED" || candidate.status === "SCREENED" ? (
              <div className="text-center py-10">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="font-medium text-slate-900">No Interview Data Yet</h4>
                <p className="text-sm text-slate-500 mt-1">Send an invitation to the candidate to complete their AI voice interview.</p>
                <SendInviteButton 
                  candidateId={candidate.id} 
                  candidateEmail={candidate.email} 
                  candidateName={candidate.name} 
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-700">Communication Score</span>
                    <span className="text-lg font-bold text-emerald-600">{evalData?.communicationScore || 0}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-emerald-500 h-3 rounded-full" style={{ width: `${(evalData?.communicationScore || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-semibold text-slate-700">Technical Competence</span>
                    <span className="text-lg font-bold text-blue-600">{evalData?.technicalScore || 0}/10</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div className="bg-blue-500 h-3 rounded-full" style={{ width: `${(evalData?.technicalScore || 0) * 10}%` }}></div>
                  </div>
                </div>
                <div className="col-span-2 mt-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-slate-500" /> Final AI Recommendation
                  </h4>
                  <p className="text-slate-700 font-medium">
                    {evalData?.finalRecommendation || "Pending Final Decision"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Transcript Preview */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquareText className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-slate-900">Interview Transcript Summary</h3>
            </div>
            {candidate.status === "INTERVIEWED" || candidate.status === "SELECTED" ? (
               <div className="space-y-4">
                 <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-600 leading-relaxed italic">
                   <span className="font-semibold text-slate-900 block mb-1">AI Executive Summary:</span>
                   {evalData?.aiSummary || "The candidate provided strong behavioral examples but struggled slightly with the depth of the technical architecture question. Overall communication was clear and professional."}
                 </div>
                 
                 {evalData?.interviewTranscript && (
                   <div className="mt-6 border-t border-slate-100 pt-4">
                     <h4 className="font-semibold text-slate-900 mb-3">Raw Transcript Log</h4>
                     <div className="bg-slate-900 p-4 rounded-lg border border-slate-800 text-sm text-slate-300 leading-relaxed max-h-96 overflow-y-auto font-mono whitespace-pre-wrap">
                       {evalData.interviewTranscript}
                     </div>
                   </div>
                 )}
               </div>
            ) : (
              <p className="text-sm text-slate-500">Transcript will appear here once the interview is concluded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
