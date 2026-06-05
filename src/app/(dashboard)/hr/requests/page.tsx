import { db } from "@/lib/prisma";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import HRActionButtons from "./HRActionButtons";

export default async function HRActionRequestsPage() {
  const requests = await db.hRActionRequest.findMany({
    where: { status: "PENDING" },
    include: {
      requester: true,
      targetEmployee: true
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Action Center</h1>
          <p className="text-slate-500 mt-1">Review and execute pending personnel requests from Management.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <h2 className="font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Pending Requests ({requests.length})
          </h2>
        </div>

        <div className="divide-y divide-slate-100">
          {requests.map((req) => (
            <div key={req.id} className="p-6 hover:bg-slate-50/50 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2.5 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-md">
                      {req.actionType}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      Requested by {req.requester.name} on {new Date(req.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Terminate Employee: {req.targetEmployee.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    "{req.reason}"
                  </p>
                </div>
                
                <HRActionButtons requestId={req.id} targetUserId={req.targetEmployee.id} targetUserEmail={req.targetEmployee.email || ""} />
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-slate-900">All caught up!</p>
              <p className="text-sm mt-1">There are no pending action requests from management.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
