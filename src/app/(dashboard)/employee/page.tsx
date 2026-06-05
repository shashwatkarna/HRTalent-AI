import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Wallet, UserCircle, Briefcase, FileText, Clock, Users, Star, Award } from "lucide-react";
import Link from "next/link";
import { endOfMonth, format, differenceInDays } from "date-fns";
import ClockInClient from "./attendance/ClockInClient";
import { OnboardingChecklist } from "./OnboardingChecklist";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    redirect("/login");
  }

  // Fetch the employee's data from Prisma
  let user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { 
      employeeProfile: {
        include: {
          department: true,
          leaveRequests: true,
          payslips: {
            orderBy: { createdAt: "desc" },
            take: 3
          }
        }
      } 
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Auto-create profile if missing (happens on seeded accounts after DB reset)
  if (!user.employeeProfile) {
    await db.employeeProfile.create({
      data: {
        userId: user.id,
        employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
        designation: "Employee",
        salary: 65000,
        employmentStatus: "ACTIVE",
      }
    });
    
    // Refetch to get the newly created profile with all includes
    user = await db.user.findUnique({
      where: { email: authUser.email },
      include: { 
        employeeProfile: {
          include: {
            department: true,
            leaveRequests: true,
            payslips: {
              orderBy: { createdAt: "desc" },
              take: 3
            }
          }
        } 
      }
    });
  }

  const profile = user!.employeeProfile!;

  // 1. Calculate Leave Balance
  const totalLeaveAllowed = 14;
  const usedLeave = profile.leaveRequests
    .filter((req: any) => req.status === "APPROVED")
    .reduce((sum: any, req: any) => sum + differenceInDays(req.endDate, req.startDate) + 1, 0);
  const remainingLeave = Math.max(totalLeaveAllowed - usedLeave, 0);

  // 2. Next Pay Date (Last day of current month)
  const nextPayDate = format(endOfMonth(new Date()), "MMM dd");

  // 3. Calculate Tenure (Length of Service)
  let tenureString = "New Joiner";
  if (profile.joiningDate) {
    const days = differenceInDays(new Date(), new Date(profile.joiningDate));
    if (days < 30) {
      tenureString = `${Math.max(days, 0)} Days`;
    } else if (days < 365) {
      tenureString = `${Math.floor(days / 30)} Months`;
    } else {
      const years = Math.floor(days / 365);
      const remainingMonths = Math.floor((days % 365) / 30);
      tenureString = remainingMonths > 0 ? `${years}Y ${remainingMonths}M` : `${years} Years`;
    }
  }

  // 4. Recent documents (Payslips)
  const recentDocuments = profile.payslips.map((ps: any) => ({
    title: `${format(new Date(ps.month + "-01"), "MMMM yyyy")} Payslip`,
    date: format(ps.createdAt, "MMM dd, yyyy"),
    type: "PDF"
  }));

  if (recentDocuments.length === 0) {
    recentDocuments.push({ title: "Welcome Packet", date: format(new Date(), "MMM dd, yyyy"), type: "PDF" });
  }

  // 5. Query today's attendance
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todaysAttendance = await db.attendance.findFirst({
    where: {
      employeeProfileId: profile.id,
      date: today
    }
  });

  // 6. Recent leave requests (sorted by created date)
  const recentLeaves = [...profile.leaveRequests]
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // 7. My Team & Manager
  let manager = null;
  let peers: any[] = [];
  if (profile.managerId) {
    manager = await db.employeeProfile.findUnique({
      where: { id: profile.managerId },
      include: { user: true }
    });
    peers = await db.employeeProfile.findMany({
      where: { managerId: profile.managerId, id: { not: profile.id } },
      include: { user: true },
      take: 4
    });
  }

  // 8. Performance Reviews
  const performanceReviews = await db.performanceReview.findMany({
    where: { employeeProfileId: profile.id },
    include: { reviewCycle: true },
    orderBy: { createdAt: "desc" },
    take: 2
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Onboarding Checklist for First-Time Logins */}
      <OnboardingChecklist employeeName={user!.name?.split(" ")[0] || "Employee"} />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-md">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-2xl font-bold">
            {user?.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full rounded-full object-cover border border-white/30" />
            ) : (
              user?.name ? user.name.substring(0, 2).toUpperCase() : "EM"
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user!.name?.split(" ")[0] || "Employee"}!</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> 
              {profile.designation || "Software Engineer"} • {profile.department?.name || "Engineering"}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Leave Balance */}
        <Link href="/employee/leave" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Available Leave</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">{remainingLeave}</h3>
              <span className="text-sm text-slate-500">days</span>
            </div>
          </div>
        </Link>

        {/* Next Payroll */}
        <Link href="/employee/payroll" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Next Pay Date</p>
            <h3 className="text-2xl font-bold text-slate-900">{nextPayDate}</h3>
          </div>
        </Link>

        {/* Length of Service */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-purple-300 transition-colors group">
          <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <Clock className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Length of Service</p>
            <h3 className="text-2xl font-bold text-slate-900">{tenureString}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Recent Payslips & Leave Requests */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Recent Documents */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-lg">Recent Documents</h2>
              <Link href="/employee/payroll" className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</Link>
            </div>
            <div className="divide-y divide-slate-100 p-2">
                {recentDocuments.map((doc: any, idx: any) => (
                  <div key={idx} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm">{doc.title}</h4>
                      <p className="text-xs text-slate-500">{doc.date}</p>
                    </div>
                  </div>
                  <button className="text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors">Download</button>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Leave Requests */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h2 className="font-bold text-slate-900 text-lg">Recent Leave Requests</h2>
              <Link href="/employee/leave" className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</Link>
            </div>
            <div className="divide-y divide-slate-100 p-2">
              {recentLeaves.length === 0 ? (
                <div className="p-6 text-center text-slate-500 text-sm">No leave requests submitted yet.</div>
              ) : (
                recentLeaves.map((leave: any, idx: any) => (
                  <div key={idx} className="p-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 text-sm">{leave.type} Leave</h4>
                        <p className="text-xs text-slate-500">
                          {format(new Date(leave.startDate), "MMM dd")} - {format(new Date(leave.endDate), "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      leave.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      leave.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Attendance & Clock Widget */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between h-[320px]">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Today's Shift</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">{format(new Date(), "EEEE, MMMM do")}</p>
              </div>
              <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4 text-xs font-medium text-slate-600 mb-6">
              <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
                <span>Clock In</span>
                <span className="font-bold text-slate-800">
                  {todaysAttendance?.clockIn ? format(new Date(todaysAttendance.clockIn), "h:mm a") : "--:--"}
                </span>
              </div>
              <div className="flex justify-between items-center py-2.5">
                <span>Clock Out</span>
                <span className="font-bold text-slate-800">
                  {todaysAttendance?.clockOut ? format(new Date(todaysAttendance.clockOut), "h:mm a") : "--:--"}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ClockInClient 
              employeeId={profile.id}
              hasClockedIn={!!todaysAttendance?.clockIn}
              hasClockedOut={!!todaysAttendance?.clockOut}
              clockInTime={todaysAttendance?.clockIn ? format(new Date(todaysAttendance.clockIn), "h:mm a") : null}
              clockOutTime={todaysAttendance?.clockOut ? format(new Date(todaysAttendance.clockOut), "h:mm a") : null}
            />
          </div>
        </div>

      </div>

      {/* New Row: My Team & Performance Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* My Team */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              My Team
            </h2>
            <Link href="/directory" className="text-sm text-blue-600 font-semibold hover:text-blue-700">View Org Chart</Link>
          </div>
          <div className="p-6">
            {!manager ? (
              <div className="text-sm text-slate-500 text-center py-4">No team data available.</div>
            ) : (
              <div className="space-y-6">
                {/* Manager */}
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Direct Manager</h3>
                  <div className="flex items-center gap-3 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                      {manager.user.name ? manager.user.name.substring(0, 2).toUpperCase() : "M"}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{manager.user.name}</h4>
                      <p className="text-xs text-slate-500">{manager.designation}</p>
                    </div>
                  </div>
                </div>

                {/* Peers */}
                {peers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Peers</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {peers.map(peer => (
                        <div key={peer.id} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <div className="w-8 h-8 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-xs">
                            {peer.user.name ? peer.user.name.substring(0, 2).toUpperCase() : "P"}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-xs truncate max-w-[100px]">{peer.user.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate max-w-[100px]">{peer.designation}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Performance Reviews */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500" />
              Performance Reviews
            </h2>
            <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">All Reviews</button>
          </div>
          <div className="p-6">
            {performanceReviews.length === 0 ? (
              <div className="text-sm text-slate-500 text-center py-8">
                <Award className="w-10 h-10 mx-auto text-slate-200 mb-2" />
                No performance reviews found.
              </div>
            ) : (
              <div className="space-y-4">
                {performanceReviews.map(review => (
                  <div key={review.id} className="border border-slate-100 rounded-xl p-4 hover:border-blue-100 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{review.reviewCycle.name}</h4>
                        <p className="text-xs text-slate-500">Status: <span className="font-semibold capitalize text-amber-600">{review.reviewCycle.status.toLowerCase()}</span></p>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {review.rating ? `${review.rating}/5` : "Pending"}
                      </div>
                    </div>
                    {review.managerComments ? (
                      <p className="text-xs text-slate-600 mt-3 line-clamp-2 italic border-l-2 border-slate-200 pl-2">
                        "{review.managerComments}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-slate-400 mt-2">Waiting for manager feedback.</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
