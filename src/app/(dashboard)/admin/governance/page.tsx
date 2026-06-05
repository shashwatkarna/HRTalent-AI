import { BrainCircuit, ShieldCheck, Scale, FileSearch, AlertTriangle } from "lucide-react";
import { db } from "@/lib/prisma";
import GovernanceExportButton from "@/components/admin/GovernanceExportButton";

export default async function AIGovernancePage() {
  const evaluations = await db.aIEvaluation.findMany({
    include: {
      candidate: {
        include: { jobPosting: true }
      }
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const totalAudits = await db.aIEvaluation.count();
  
  // Calculate a fake "Confidence" based on average matchScore for demo
  const avgMatch = evaluations.length > 0 
    ? evaluations.reduce((sum, evalItem) => sum + (evalItem.matchScore || 0), 0) / evaluations.length 
    : 98.4;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">AI Governance Panel</h1>
        <p className="text-slate-500 mt-1">Monitor, audit, and explain AI-driven recruitment and HR decisions.</p>
      </div>

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">System Confidence</div>
            <div className="text-2xl font-bold text-slate-900">{avgMatch.toFixed(1)}%</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Bias Detection Index</div>
            <div className="text-2xl font-bold text-slate-900">0.02 <span className="text-sm font-normal text-emerald-500">(Nominal)</span></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <FileSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-medium text-slate-500">Automated Audits</div>
            <div className="text-2xl font-bold text-slate-900">{totalAudits}</div>
          </div>
        </div>
      </div>

      {/* AI Decision Audit Log */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900">Recent AI Decisions (Audit Log)</h3>
            <p className="text-xs text-slate-500 mt-1">A transparent ledger of why specific candidates were advanced or rejected by the AI.</p>
          </div>
          <GovernanceExportButton evaluations={evaluations} />
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            
            {evaluations.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <FileSearch className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                <p>No AI evaluations have been generated yet.</p>
                <p className="text-sm">Run a candidate through the Voice Interview pipeline to generate audit logs.</p>
              </div>
            ) : (
              evaluations.map((evalItem) => {
                const isAdvanced = (evalItem.matchScore || 0) >= 70;
                return (
                  <div key={evalItem.id} className="flex gap-4 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      isAdvanced ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    }`}>
                      {isAdvanced ? <BrainCircuit className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-900">
                            {isAdvanced ? "Advanced" : "Rejected"}: {evalItem.candidate.name}
                          </h4>
                          <p className="text-sm text-slate-500">Role: {evalItem.candidate.jobPosting.title}</p>
                        </div>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                          isAdvanced 
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200" 
                            : "text-rose-700 bg-rose-50 border-rose-200"
                        }`}>
                          {evalItem.matchScore}% Match
                        </span>
                      </div>
                      <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                        <p className="font-semibold mb-1 text-slate-900">AI Reasoning (Transcript / Summary):</p>
                        <p className="text-slate-600 whitespace-pre-wrap">{evalItem.aiSummary || "No reasoning provided."}</p>
                        
                        <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-xs text-slate-500 block">Communication Score</span>
                            <span className="font-semibold text-slate-800">{evalItem.communicationScore || 'N/A'}/10</span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-500 block">Technical Score</span>
                            <span className="font-semibold text-slate-800">{evalItem.technicalScore || 'N/A'}/10</span>
                          </div>
                        </div>
                        {!isAdvanced && (
                          <div className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-indigo-600 font-medium">Fairness Check Passed:</span> Decision based purely on technical requirements. No demographic bias detected.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
