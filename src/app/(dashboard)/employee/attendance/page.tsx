import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Clock, Calendar, CheckCircle2 } from "lucide-react";
import { format, formatDuration, intervalToDuration } from "date-fns";
import AttendanceClient from "./AttendanceClient";

export default async function EmployeeAttendancePage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user?.employeeProfile) redirect("/login");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch today's attendance
  const todaysAttendance = await db.attendance.findFirst({
    where: {
      employeeProfileId: user.employeeProfile.id,
      date: today
    }
  });

  // Fetch recent history
  const history = await db.attendance.findMany({
    where: {
      employeeProfileId: user.employeeProfile.id,
      date: { lt: today }
    },
    orderBy: { date: "desc" },
    take: 7
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Attendance</h1>
        <p className="text-slate-500">Track your daily hours and clock in/out.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clock In/Out Panel */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{format(new Date(), "EEEE, MMMM do")}</h2>
          <p className="text-slate-500 mb-8">{format(new Date(), "h:mm a")}</p>
          
          <AttendanceClient 
            clockInTime={todaysAttendance?.clockIn ? todaysAttendance.clockIn.toISOString() : null}
            clockOutTime={todaysAttendance?.clockOut ? todaysAttendance.clockOut.toISOString() : null}
          />
        </div>

        {/* Today's Summary */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
          
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Today's Status
          </h3>

          <div className="space-y-6">
            <div>
              <p className="text-slate-400 text-sm mb-1">Clock In</p>
              <p className="font-semibold text-lg">
                {todaysAttendance?.clockIn ? format(new Date(todaysAttendance.clockIn), "h:mm a") : "--:--"}
              </p>
            </div>
            
            <div className="h-px bg-slate-800" />
            
            <div>
              <p className="text-slate-400 text-sm mb-1">Clock Out</p>
              <p className="font-semibold text-lg">
                {todaysAttendance?.clockOut ? format(new Date(todaysAttendance.clockOut), "h:mm a") : "--:--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-900 text-lg">Recent History</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {history.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No recent attendance records found.</div>
          ) : (
            history.map((record) => {
              const clockIn = record.clockIn ? new Date(record.clockIn) : null;
              const clockOut = record.clockOut ? new Date(record.clockOut) : null;
              
              let durationStr = "N/A";
              if (clockIn && clockOut) {
                const dur = intervalToDuration({ start: clockIn, end: clockOut });
                durationStr = `${dur.hours || 0}h ${dur.minutes || 0}m`;
              }

              return (
                <div key={record.id} className="p-4 px-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{format(new Date(record.date), "MMM dd, yyyy")}</span>
                    <span className="text-xs font-bold text-emerald-600 uppercase mt-1">{record.status}</span>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500">In</span>
                      <span className="font-medium text-slate-900">{clockIn ? format(clockIn, "h:mm a") : "--"}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-slate-500">Out</span>
                      <span className="font-medium text-slate-900">{clockOut ? format(clockOut, "h:mm a") : "--"}</span>
                    </div>
                    <div className="flex flex-col items-end hidden md:flex min-w-[80px]">
                      <span className="text-slate-500">Total</span>
                      <span className="font-bold text-blue-600">{durationStr}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
