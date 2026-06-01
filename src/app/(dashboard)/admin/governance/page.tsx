import { BrainCircuit, ShieldCheck, Scale, FileSearch, AlertTriangle } from "lucide-react";

export default function AIGovernancePage() {
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
            <div className="text-2xl font-bold text-slate-900">98.4%</div>
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
            <div className="text-2xl font-bold text-slate-900">14,203</div>
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
          <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">Export Report</button>
        </div>
        
        <div className="p-6">
          <div className="space-y-6">
            
            {/* Log Entry 1 */}
            <div className="flex gap-4 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900">Advanced: Alex Johnson</h4>
                    <p className="text-sm text-slate-500">Role: Senior Frontend Developer</p>
                  </div>
                  <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">92% Match</span>
                </div>
                <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                  <p className="font-semibold mb-1 text-slate-900">AI Reasoning:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Candidate possesses 6 years of React experience (exceeds requirement of 5).</li>
                    <li>Strong semantic alignment with "Next.js" and "Tailwind CSS" in past projects.</li>
                    <li>Communication score from Voice AI was 8.5/10.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Log Entry 2 */}
            <div className="flex gap-4 pb-6 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-900">Rejected: Anonymous Profile #842</h4>
                    <p className="text-sm text-slate-500">Role: Backend Engineer</p>
                  </div>
                  <span className="text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">31% Match</span>
                </div>
                <div className="mt-3 bg-slate-50 p-4 rounded-lg border border-slate-100 text-sm text-slate-700">
                  <p className="font-semibold mb-1 text-slate-900">AI Reasoning:</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    <li>Missing core requirement: PostgreSQL experience.</li>
                    <li>Total backend experience calculated at 1.2 years (requirement: 4+).</li>
                    <li><span className="text-indigo-600 font-medium">Fairness Check Passed:</span> Decision based purely on technical requirements. No demographic bias detected.</li>
                  </ul>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
