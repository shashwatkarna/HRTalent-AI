import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { CalendarDays, Wallet, UserCircle, Briefcase, FileText, BotMessageSquare } from "lucide-react";
import Link from "next/link";

export default async function EmployeeDashboardPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) {
    redirect("/login");
  }

  // Fetch the employee's data from Prisma
  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user || user.role !== "EMPLOYEE") {
    // If they aren't an employee, they shouldn't be here (though middleware usually handles this)
    redirect("/admin");
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-md">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 text-2xl font-bold">
            {user.name ? user.name.substring(0, 2).toUpperCase() : "EM"}
          </div>
          <div>
            <h1 className="text-3xl font-bold mb-1">Welcome back, {user.name}!</h1>
            <p className="text-blue-100 flex items-center gap-2">
              <Briefcase className="w-4 h-4" /> 
              {user.employeeProfile?.position || "Software Engineer"} • {user.employeeProfile?.department || "Engineering"}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link href="/employee/support">
            <button className="bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4" /> Ask HR AI
            </button>
          </Link>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Leave Balance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <CalendarDays className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Available Leave</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-bold text-slate-900">14</h3>
              <span className="text-sm text-slate-500">days</span>
            </div>
          </div>
        </div>

        {/* Next Payroll */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Next Pay Date</p>
            <h3 className="text-2xl font-bold text-slate-900">Nov 30</h3>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-5 hover:border-blue-300 transition-colors cursor-pointer group">
          <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
            <UserCircle className="w-7 h-7" />
          </div>
          <div className="w-full">
            <div className="flex justify-between items-center mb-1.5">
              <p className="text-sm font-medium text-slate-500">Profile</p>
              <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">85%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div className="bg-purple-600 h-2 rounded-full w-[85%]"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Payslips */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
            <h2 className="font-bold text-slate-900 text-lg">Recent Documents</h2>
            <button className="text-sm text-blue-600 font-semibold hover:text-blue-700">View All</button>
          </div>
          <div className="divide-y divide-slate-100 p-2">
            {[
              { title: "October Payslip", date: "Oct 31, 2026", type: "PDF" },
              { title: "Q3 Performance Review", date: "Oct 15, 2026", type: "PDF" },
              { title: "September Payslip", date: "Sep 30, 2026", type: "PDF" },
            ].map((doc, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
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
          
          <Link href="/employee/support" className="mt-auto">
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              Chat with AI HR
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
