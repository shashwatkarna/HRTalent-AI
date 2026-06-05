import { db } from "@/lib/prisma";
import { BarChart3, Users, PieChart, Activity, Building2 } from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ExportButtons } from "@/components/ui/ExportButtons";

export default async function AdminAnalyticsPage() {
  // Fetch real department data
  const departments = await db.department.findMany({
    include: {
      _count: {
        select: { employees: true }
      }
    }
  });

  const totalHeadcount = departments.reduce((sum, dept) => sum + dept._count.employees, 0);

  // Colors for the charts
  const colors = ["bg-indigo-500", "bg-emerald-500", "bg-rose-500", "bg-blue-500", "bg-amber-500", "bg-purple-500"];

  // Fetch Attrition Reasons
  const terminatedEmployees = await db.employeeProfile.findMany({
    where: { employmentStatus: "TERMINATED" },
    select: { attritionReason: true }
  });

  const attritionCounts: Record<string, number> = {};
  terminatedEmployees.forEach(emp => {
    const reason = emp.attritionReason || "Other";
    attritionCounts[reason] = (attritionCounts[reason] || 0) + 1;
  });

  const totalTerminated = terminatedEmployees.length;
  const attritionEntries = Object.entries(attritionCounts).map(([reason, count]) => ({
    reason,
    count,
    percentage: totalTerminated > 0 ? Math.round((count / totalTerminated) * 100) : 0
  })).sort((a, b) => b.count - a.count);

  // Fetch Headcount Growth over last 6 months
  // We will calculate this based on joiningDates
  const now = new Date();
  const sixMonthsAgo = subMonths(now, 5); // 6 months inclusive

  const allEmployees = await db.employeeProfile.findMany({
    select: { joiningDate: true, employmentStatus: true }
  });

  const months: string[] = [];
  const growthData: number[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = subMonths(now, i);
    const endOfTargetMonth = endOfMonth(monthDate);
    
    // Count employees who joined BEFORE OR ON the end of this month
    const activeAtTime = allEmployees.filter(emp => {
      if (!emp.joiningDate) return false;
      return emp.joiningDate <= endOfTargetMonth;
    }).length;

    months.push(format(monthDate, 'MMM'));
    growthData.push(activeAtTime);
  }

  // To draw the chart, find the max value to normalize heights
  const maxGrowth = Math.max(...growthData, 1);

  return (
    <div id="analytics-dashboard" className="p-8 max-w-7xl mx-auto space-y-8 bg-slate-50">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Company Analytics</h1>
          <p className="text-slate-500 mt-2">Deep-dive into workforce distribution and company health.</p>
        </div>
        <ExportButtons elementId="analytics-dashboard" filename="AITalent_Company_Analytics" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Distribution */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              Headcount by Department
            </h3>
            <span className="text-xs font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded">Total: {totalHeadcount}</span>
          </div>

          <div className="flex-1 space-y-4">
            {departments.map((dept, index) => {
              const percentage = totalHeadcount > 0 ? Math.round((dept._count.employees / totalHeadcount) * 100) : 0;
              const color = colors[index % colors.length];

              return (
                <div key={dept.id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-slate-700">{dept.name}</span>
                    <div className="text-right">
                      <span className="text-slate-900 font-bold">{dept._count.employees}</span>
                      <span className="text-slate-400 text-xs ml-1">({percentage}%)</span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                  </div>
                </div>
              );
            })}

            {departments.length === 0 && (
              <p className="text-sm text-slate-500 text-center py-8">No department data available.</p>
            )}
          </div>
        </div>

        {/* Dynamic Attrition Reasons */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-rose-600" />
              Attrition Reasons (All Time)
            </h3>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {totalTerminated > 0 ? (
              <>
                <div className="w-full h-8 flex rounded-xl overflow-hidden shadow-inner mb-6">
                  {attritionEntries.map((entry, i) => (
                    <div 
                      key={entry.reason} 
                      className={`${colors[i % colors.length]} h-full`} 
                      style={{ width: `${entry.percentage}%` }} 
                      title={`${entry.reason} (${entry.percentage}%)`}
                    ></div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {attritionEntries.map((entry, i) => (
                    <div key={entry.reason} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`}></div>
                      <div>
                        <div className="text-sm font-bold text-slate-900">{entry.percentage}%</div>
                        <div className="text-xs text-slate-500">{entry.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
               <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                 <p className="text-sm font-medium text-slate-900">0 Terminations</p>
                 <p className="text-xs text-slate-500 mt-1">No attrition data available.</p>
               </div>
            )}
          </div>
        </div>

        {/* Dynamic Growth Trend */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm col-span-1 lg:col-span-2 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-center mb-8 relative z-10">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                Headcount Growth (Trailing 6 Months)
              </h3>
              <p className="text-slate-400 text-sm mt-1">Based on actual employee joining dates.</p>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-center backdrop-blur-sm">
              <div className="text-xs text-slate-300 uppercase tracking-wider font-semibold">Current Count</div>
              <div className="text-xl font-bold text-emerald-400">{growthData[growthData.length - 1]}</div>
            </div>
          </div>

          <div className="h-48 flex gap-2 relative z-10 pt-8">
            {growthData.map((count, i) => {
              const heightPercent = maxGrowth > 0 ? Math.round((count / maxGrowth) * 100) : 0;
              return (
                <div key={i} className="flex-1 flex flex-col h-full">
                  <div className="flex-1 w-full flex items-end group">
                    <div className="w-full bg-indigo-500/30 group-hover:bg-indigo-400/50 rounded-t-lg transition-all duration-300 relative" style={{ height: `${heightPercent}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-slate-900 text-xs font-bold px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {count} Employees
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-slate-400 mt-2 font-medium">
                    {months[i]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
