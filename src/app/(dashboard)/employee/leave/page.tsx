import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Clock, CheckCircle2, XCircle } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import LeaveClient from "./LeaveClient";

export default async function EmployeeLeavePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user?.employeeProfile) redirect("/login");

  const requests = await db.leaveRequest.findMany({
    where: { employeeProfileId: user.employeeProfile.id },
    orderBy: { createdAt: "desc" }
  });

  const totalLeaveAllowed = 14;
  const usedLeave = requests
    .filter(req => req.status === "APPROVED")
    .reduce((sum, req) => sum + differenceInDays(req.endDate, req.startDate) + 1, 0);
  const remainingLeave = Math.max(totalLeaveAllowed - usedLeave, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Leave Management</h1>
          <p className="text-slate-500">Track your time off and submit new requests.</p>
        </div>
        <LeaveClient />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Available Leave</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{remainingLeave}</h3>
              <span className="text-sm text-slate-500">days</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Used Leave</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{usedLeave}</h3>
              <span className="text-sm text-slate-500">days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100">
          <h2 className="font-bold text-slate-900 text-lg">Leave History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="font-medium p-4 pl-6">Type</th>
                <th className="font-medium p-4">Duration</th>
                <th className="font-medium p-4">Days</th>
                <th className="font-medium p-4">Requested On</th>
                <th className="font-medium p-4 pr-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No leave requests found.</td>
                </tr>
              ) : (
                requests.map(req => {
                  const days = differenceInDays(new Date(req.endDate), new Date(req.startDate)) + 1;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 pl-6 font-medium text-slate-900">{req.type}</td>
                      <td className="p-4 text-slate-600">
                        {format(new Date(req.startDate), "MMM d")} - {format(new Date(req.endDate), "MMM d, yyyy")}
                      </td>
                      <td className="p-4 text-slate-600">{days}</td>
                      <td className="p-4 text-slate-600">{format(new Date(req.createdAt), "MMM d, yyyy")}</td>
                      <td className="p-4 pr-6">
                        {req.status === "APPROVED" && <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold text-xs"><CheckCircle2 className="w-3 h-3"/> Approved</span>}
                        {req.status === "PENDING" && <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold text-xs"><Clock className="w-3 h-3"/> Pending</span>}
                        {req.status === "REJECTED" && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded font-bold text-xs"><XCircle className="w-3 h-3"/> Rejected</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
