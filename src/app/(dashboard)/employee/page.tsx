import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Wallet, UserCircle, Briefcase, FileText, BotMessageSquare } from "lucide-react";
import Link from "next/link";
import { endOfMonth, format, differenceInDays } from "date-fns";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    redirect("/login");
  }

  // Fetch the employee's data from Prisma
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

  if (!user || user.role !== "EMPLOYEE") {
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

  // 3. Calculate Profile Completion
  let completedFields = 0;
  const totalFields = 5;
  if (user!.name) completedFields++;
  if (profile.contactNumber) completedFields++;
  if (profile.address) completedFields++;
  if (profile.departmentId) completedFields++;
  if (profile.joiningDate) completedFields++;
  const profileCompletion = Math.round((completedFields / totalFields) * 100);

  // 4. recent documents (Payslips)
  const recentDocuments = profile.payslips.map((ps: any) => ({
    title: `${format(new Date(ps.month + "-01"), "MMMM yyyy")} Payslip`,
    date: format(ps.createdAt, "MMM dd, yyyy"),
    type: "PDF"
  }));

  if (recentDocuments.length === 0) {
    recentDocuments.push({ title: "Welcome Packet", date: format(new Date(), "MMM dd, yyyy"), type: "PDF" });
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-md">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-2xl font-bold">
            {user!.name ? user!.name.substring(0, 2).toUpperCase() : "EM"}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user!.name?.split(" ")[0] || "Employee"}!</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> 
              {profile.designation || "Software Engineer"} • {profile.department?.name || "Engineering"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/employee/ai-assistant">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4" /> Ask HR AI
            </button>
          </Link>
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

        {/* Profile Completion */}
        <Link href="/employee" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <UserCircle className="w-7 h-7" />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-sm font-medium text-slate-500">Profile</p>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{profileCompletion}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${profileCompletion}%` }}></div>
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Payslips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
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

        {/* AI Support Teaser */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden flex flex-col">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/20 rounded-full blur-2xl"></div>
          <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"></div>
          
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
            <BotMessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          
          <h3 className="text-xl font-bold mb-2">Have an HR question?</h3>
          <p className="text-slate-300 text-sm mb-8 leading-relaxed">
            Our AI Assistant knows the entire employee handbook. Ask about leave policies, benefits, or tax forms instantly.
          </p>
          
          <Link href="/employee/ai-assistant" className="mt-auto relative z-10">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              Chat with AI HR
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
