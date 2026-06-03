import { db } from "@/lib/prisma";
import { format } from "date-fns";
import LeaveActionButtons from "./LeaveActionButtons";

export default async function LeaveApprovalsPage() {
  // Hardcode Mike Manager's ID for the demo
  const managerProfile = await db.employeeProfile.findUnique({
    where: { employeeId: 'EMP-003' },
    include: {
      directReports: {
        include: {
          user: true,
          leaveRequests: {
            orderBy: { createdAt: 'desc' }
          }
        }
      }
    }
  });

  if (!managerProfile) return <div>Manager profile not found</div>;

  // Flatten the leave requests into a single array
  const allLeaves = managerProfile.directReports.flatMap(emp => 
    emp.leaveRequests.map(leave => ({
      ...leave,
      employeeName: emp.user.name,
      employeeEmail: emp.user.email,
      employeeId: emp.employeeId,
      designation: emp.designation
    }))
  ).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const pendingLeaves = allLeaves.filter(l => l.status === "PENDING");
  const pastLeaves = allLeaves.filter(l => l.status !== "PENDING");

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Approvals</h1>
        <p className="text-slate-500 mt-2">Manage time off requests from your direct reports.</p>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-900">Action Required</h2>
        {pendingLeaves.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 mb-4">
              <span className="text-emerald-600 text-xl">🎉</span>
            </div>
            <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
            <p className="text-slate-500 mt-1">No pending leave requests from your team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingLeaves.map((leave) => (
              <div key={leave.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">{leave.employeeName}</h3>
                      <p className="text-xs text-slate-500">{leave.designation}</p>
                    </div>
                    <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      Pending
                    </span>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Type</p>
                      <p className="font-medium text-slate-700">{leave.type}</p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Dates</p>
                      <p className="font-medium text-slate-700">
                        {format(leave.startDate, 'MMM dd')} - {format(leave.endDate, 'MMM dd, yyyy')}
                      </p>
                    </div>
                    {leave.reason && (
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-1">Reason</p>
                        <p className="text-sm text-slate-600 line-clamp-2">{leave.reason}</p>
                      </div>
                    )}
                  </div>
                </div>

                <LeaveActionButtons leaveId={leave.id} />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pt-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-6">Past Requests</h2>
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-4 font-medium">Employee</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {pastLeaves.map((leave) => (
                  <tr key={leave.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">{leave.employeeName}</p>
                      <p className="text-xs text-slate-500">{leave.employeeId}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {leave.type}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">
                      {format(leave.startDate, 'MMM dd')} - {format(leave.endDate, 'MMM dd')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                        leave.status === 'APPROVED' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {leave.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {pastLeaves.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No past leave requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
