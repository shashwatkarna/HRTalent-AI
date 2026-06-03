import { db } from "@/lib/prisma";
import { Wallet, TrendingUp, DollarSign, Download, Users } from "lucide-react";
import RunPayrollClient from "./RunPayrollClient";
import { format } from "date-fns";

export default async function AdminPayrollPage() {
  // Fetch all active employees
  const activeEmployees = await db.employeeProfile.findMany({
    where: { employmentStatus: "ACTIVE" },
    include: {
      user: true,
      department: true
    },
    orderBy: { salary: 'desc' }
  });

  // Calculate high-level payroll metrics
  const totalAnnualPayroll = activeEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0);
  const monthlyRunRate = totalAnnualPayroll / 12;
  
  // Fake calculation for demo purposes: 5% allowances, 12% deductions (tax, benefits)
  const estimatedMonthlyAllowances = monthlyRunRate * 0.05;
  const estimatedMonthlyDeductions = monthlyRunRate * 0.12;
  const netMonthlyPayout = monthlyRunRate + estimatedMonthlyAllowances - estimatedMonthlyDeductions;

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Check if payroll was already run for the current month
  const currentMonth = format(new Date(), "yyyy-MM");
  const existingPayslip = await db.payslip.findFirst({
    where: { month: currentMonth }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Global Payroll</h1>
          <p className="text-slate-500 mt-2">Manage company-wide compensation and monthly run rates.</p>
        </div>
        <RunPayrollClient currentMonth={currentMonth} isAlreadyRun={!!existingPayslip} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-xs font-medium bg-white/10 text-slate-300 px-2 py-1 rounded-lg">Estimated Net</span>
          </div>
          <div className="text-3xl font-black mb-1">{formatCurrency(netMonthlyPayout)}</div>
          <div className="text-sm font-medium text-slate-400">Total Monthly Payout</div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-slate-600" />
            </div>
            <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">Base Salary</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(monthlyRunRate)}</div>
          <div className="text-sm font-medium text-slate-500">Gross Monthly Run Rate</div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">Bonuses & Perks</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(estimatedMonthlyAllowances)}</div>
          <div className="text-sm font-medium text-slate-500">Total Allowances</div>
        </div>

        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-xs font-medium bg-rose-50 text-rose-600 px-2 py-1 rounded-lg">Taxes & Benefits</span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{formatCurrency(estimatedMonthlyDeductions)}</div>
          <div className="text-sm font-medium text-slate-500">Total Deductions</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-slate-400" />
            <h2 className="text-lg font-bold text-slate-900">Employee Breakdown</h2>
          </div>
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-1.5 rounded-lg">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 pl-6">Employee</th>
                <th className="p-4">Department</th>
                <th className="p-4">Base Salary (Annual)</th>
                <th className="p-4">Monthly Gross</th>
                <th className="p-4">Est. Net Pay</th>
                <th className="p-4 text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeEmployees.map((emp) => {
                const base = emp.salary || 0;
                const monthly = base / 12;
                const net = monthly + (monthly * 0.05) - (monthly * 0.12);

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                          {emp.user.name?.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{emp.user.name}</div>
                          <div className="text-xs text-slate-500">{emp.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-600">
                        {emp.department?.name || 'Unassigned'}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700 text-sm">{formatCurrency(base)}</td>
                    <td className="p-4 font-medium text-slate-700 text-sm">{formatCurrency(monthly)}</td>
                    <td className="p-4 font-bold text-emerald-600 text-sm">{formatCurrency(net)}</td>
                    <td className="p-4 text-right pr-6">
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800">Edit</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
