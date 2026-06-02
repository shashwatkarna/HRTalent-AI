import { Users, Briefcase, DollarSign, TrendingDown, UserPlus, Activity } from "lucide-react";
import { db } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  // Fetch real metrics from Prisma
  const totalEmployees = await db.user.count({ where: { role: { not: "ADMIN" } } });
  const openPositions = await db.jobPosting.count({ where: { isActive: true } });
  const totalCandidates = await db.candidate.count();
  
  // Calculate a simulated monthly payroll based on EmployeeProfiles (if data exists)
  const profiles = await db.employeeProfile.findMany({ select: { salary: true, employmentStatus: true } });
  const monthlyPayroll = profiles.reduce((sum, profile) => sum + (profile.salary || 0), 0) / 12;

  const terminatedProfiles = profiles.filter(p => p.employmentStatus === "TERMINATED").length;
  const attritionRate = profiles.length > 0 ? Math.round((terminatedProfiles / profiles.length) * 100 * 10) / 10 : 0;

  const appliedCount = await db.candidate.count({ where: { status: "APPLIED" } });
  const screenedCount = await db.candidate.count({ where: { status: { in: ["SCREENED", "INTERVIEWED", "SELECTED", "HIRED"] } } });
  const interviewedCount = await db.candidate.count({ where: { status: { in: ["INTERVIEWED", "SELECTED", "HIRED"] } } });
  const hiredCount = await db.candidate.count({ where: { status: "HIRED" } });

  const getPercent = (count: number) => totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-slate-500 mt-1">Company-wide analytics and workforce metrics.</p>
      </div>

      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">+12% this month</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{totalEmployees}</div>
          <div className="text-sm font-medium text-slate-500">Total Employees</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded">Active</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{openPositions}</div>
          <div className="text-sm font-medium text-slate-500">Open Positions</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{monthlyPayroll > 0 ? formatCurrency(monthlyPayroll) : "$0"}</div>
          <div className="text-sm font-medium text-slate-500">Monthly Payroll Run</div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              attritionRate > 5 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"
            }`}>
              {attritionRate > 5 ? "Needs attention" : "Healthy"}
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{attritionRate}%</div>
          <div className="text-sm font-medium text-slate-500">Attrition Rate</div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Dynamic Recruitment Funnel */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Recruitment Funnel</h3>
              <p className="text-xs text-slate-500">Real-time candidate conversion rates</p>
            </div>
            <UserPlus className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Total Applicants ({totalCandidates})</span>
                <span className="text-slate-500">100%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 w-full"></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">AI Screened Passed ({screenedCount})</span>
                <span className="text-slate-500">{getPercent(screenedCount)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${getPercent(screenedCount)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Interviewed ({interviewedCount})</span>
                <span className="text-slate-500">{getPercent(interviewedCount)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500" style={{ width: `${getPercent(interviewedCount)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-slate-700">Hired ({hiredCount})</span>
                <span className="text-slate-500">{getPercent(hiredCount)}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${getPercent(hiredCount)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Fake Chart Placeholder: Attendance Trends */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-900">Company Health</h3>
              <p className="text-xs text-slate-500">Daily attendance and productivity</p>
            </div>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          
          <div className="flex-1 flex items-end gap-2 h-40">
            {/* Simple CSS Bar Chart */}
            {[40, 60, 45, 80, 55, 90, 70, 85, 95, 60, 80, 85, 90].map((height, i) => (
              <div key={i} className="flex-1 chart-bar-fill relative group" style={{ height: `${height}%` }}>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                  {height}%
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2 border-t border-slate-100 pt-2">
            <span>May 1</span>
            <span>May 15</span>
            <span>May 30</span>
          </div>
        </div>

      </div>
    </div>
  );
}
