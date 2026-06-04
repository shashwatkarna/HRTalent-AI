import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Clock, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { format, startOfWeek, endOfWeek, addDays } from "date-fns";
import ClockInClient from "./ClockInClient";

export default async function AttendancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return <div>Not authenticated</div>;
  }

  // Find employee profile
  const employee = await db.employeeProfile.findFirst({
    where: { user: { email: user.email } },
    include: {
      attendances: {
        orderBy: { date: 'desc' },
        take: 30
      }
    }
  });

  if (!employee) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-8 bg-slate-50 rounded-2xl border border-slate-200">
          <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900">No Employee Profile Found</h2>
          <p className="text-slate-500 mt-2">Please contact your HR administrator to set up your profile.</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayAttendance = employee.attendances.find(a => {
    const aDate = new Date(a.date);
    aDate.setHours(0, 0, 0, 0);
    return aDate.getTime() === today.getTime();
  });

  const hasClockedIn = !!todayAttendance?.clockIn;
  const hasClockedOut = !!todayAttendance?.clockOut;

  // Calculate weekly stats
  const start = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 5 }).map((_, i) => addDays(start, i));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Time & Attendance</h1>
        <p className="text-slate-500 mt-2">Manage your daily clock-ins and view your attendance history.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Clock In Widget */}
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <Clock className="w-12 h-12 text-indigo-400 mb-6 relative z-10" />
          
          <div className="text-center relative z-10 mb-8">
            <h2 className="text-4xl font-black mb-2 tracking-tight">
              {format(new Date(), 'h:mm a')}
            </h2>
            <p className="text-slate-400 font-medium">
              {format(new Date(), 'EEEE, MMMM do')}
            </p>
          </div>

          <ClockInClient 
            employeeId={employee.id} 
            hasClockedIn={hasClockedIn} 
            hasClockedOut={hasClockedOut} 
            clockInTime={todayAttendance?.clockIn ? format(new Date(todayAttendance.clockIn), 'h:mm a') : null}
            clockOutTime={todayAttendance?.clockOut ? format(new Date(todayAttendance.clockOut), 'h:mm a') : null}
          />
        </div>

        {/* Weekly Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-slate-400" />
              This Week's Attendance
            </h3>
            <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
              {format(start, 'MMM d')} - {format(addDays(start, 4), 'MMM d')}
            </span>
          </div>

          <div className="flex justify-between items-end h-40 pt-4 gap-2">
            {weekDays.map((day, i) => {
              const dayDate = new Date(day);
              dayDate.setHours(0, 0, 0, 0);
              const att = employee.attendances.find(a => {
                const ad = new Date(a.date);
                ad.setHours(0,0,0,0);
                return ad.getTime() === dayDate.getTime();
              });

              let statusColor = "bg-slate-100 border-slate-200";
              let icon = null;
              
              if (dayDate.getTime() > today.getTime()) {
                // Future
                statusColor = "bg-slate-50 border-slate-100 border-dashed";
              } else if (att?.status === 'PRESENT') {
                statusColor = "bg-emerald-500 border-emerald-600";
                icon = <CheckCircle2 className="w-4 h-4 text-white absolute top-2 left-1/2 -translate-x-1/2" />;
              } else if (att?.status === 'ABSENT' || (!att && dayDate.getDay() !== 0 && dayDate.getDay() !== 6)) {
                statusColor = "bg-rose-500 border-rose-600";
                icon = <XCircle className="w-4 h-4 text-white absolute top-2 left-1/2 -translate-x-1/2" />;
              }

              // Height based on hours worked if present, fake it for UI demo if no real out-time
              let height = "20%"; // Default
              if (att?.clockIn && att?.clockOut) {
                 const diff = new Date(att.clockOut).getTime() - new Date(att.clockIn).getTime();
                 const hours = diff / (1000 * 60 * 60);
                 height = `${Math.min(100, Math.max(20, (hours / 8) * 100))}%`;
              } else if (att?.status === 'PRESENT') {
                 height = "100%";
              }

              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                  <div className={`w-full max-w-[40px] rounded-t-lg border-t border-l border-r relative transition-all ${statusColor}`} style={{ height }}>
                    {icon}
                    
                    {/* Tooltip */}
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20">
                      {att ? `${att.status}` : (dayDate.getTime() > today.getTime() ? 'Upcoming' : 'Absent')}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-slate-500 mt-3 uppercase tracking-wider">
                    {format(day, 'EEE')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="font-bold text-slate-900">Recent History</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="p-4 pl-6">Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Clock In</th>
              <th className="p-4">Clock Out</th>
              <th className="p-4">Total Hours</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employee.attendances.map((record) => {
              let hours = "--";
              if (record.clockIn && record.clockOut) {
                const diff = new Date(record.clockOut).getTime() - new Date(record.clockIn).getTime();
                hours = (diff / (1000 * 60 * 60)).toFixed(1) + "h";
              }

              return (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 pl-6 font-medium text-slate-700 text-sm">
                    {format(new Date(record.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      record.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-700' :
                      record.status === 'ABSENT' ? 'bg-rose-100 text-rose-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    {record.clockIn ? format(new Date(record.clockIn), 'h:mm a') : '--'}
                  </td>
                  <td className="p-4 text-slate-600 text-sm">
                    {record.clockOut ? format(new Date(record.clockOut), 'h:mm a') : '--'}
                  </td>
                  <td className="p-4 font-semibold text-slate-900 text-sm">
                    {hours}
                  </td>
                </tr>
              );
            })}
            
            {employee.attendances.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500 text-sm">
                  No attendance records found. Start clocking in to see your history!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
