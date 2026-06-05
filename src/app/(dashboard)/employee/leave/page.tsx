import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { CalendarDays, Plane, Stethoscope, Coffee, History } from "lucide-react";
import { format } from "date-fns";
import LeaveRequestForm from "./LeaveRequestForm";

export default async function LeavePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return <div>Not authenticated</div>;
  }

  // Find employee profile
  const employee = await db.employeeProfile.findFirst({
    where: { user: { email: user.email } },
    include: {
      leaveRequests: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!employee) {
    return <div>No Employee Profile Found</div>;
  }

  // Calculate generic leave balances (demo purposes)
  const totalAnnual = 14;
  const takenAnnual = employee.leaveRequests.filter(l => l.type === 'VACATION' && l.status === 'APPROVED').length;
  
  const totalSick = 7;
  const takenSick = employee.leaveRequests.filter(l => l.type === 'SICK' && l.status === 'APPROVED').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Leave Management</h1>
        <p className="text-slate-500 mt-2">Request time off and view your remaining balances.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
            <Plane className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Annual Leave</h3>
          <div className="text-4xl font-black text-slate-900 mb-1">{totalAnnual - takenAnnual}</div>
          <div className="text-sm font-medium text-slate-500">Days Remaining (out of {totalAnnual})</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
            <Stethoscope className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Sick Leave</h3>
          <div className="text-4xl font-black text-slate-900 mb-1">{totalSick - takenSick}</div>
          <div className="text-sm font-medium text-slate-500">Days Remaining (out of {totalSick})</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
            <Coffee className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Annual Leave</h3>
          <div className="text-4xl font-black text-slate-900 mb-1">14</div>
          <div className="text-sm font-medium text-slate-500">Subject to manager approval</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-indigo-600" />
              Request Time Off
            </h3>
            <LeaveRequestForm employeeId={employee.id} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <History className="w-5 h-5 text-slate-400" />
            Request History
          </h3>
          
          {employee.leaveRequests.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center">
              <p className="text-slate-500">You haven't made any leave requests yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employee.leaveRequests.map((req) => (
                <div key={req.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      req.type === 'VACATION' ? 'bg-blue-50 text-blue-600' :
                      req.type === 'SICK' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {req.type === 'VACATION' ? <Plane className="w-5 h-5" /> :
                       req.type === 'SICK' ? <Stethoscope className="w-5 h-5" /> :
                       <Coffee className="w-5 h-5" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 capitalize">{req.type.toLowerCase()} Leave</h4>
                      <p className="text-sm text-slate-500">
                        {format(new Date(req.startDate), 'MMM dd, yyyy')} - {format(new Date(req.endDate), 'MMM dd, yyyy')}
                      </p>
                      {req.reason && <p className="text-xs text-slate-400 mt-1 italic">"{req.reason}"</p>}
                    </div>
                  </div>
                  
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                      req.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
