import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { FileText, Download, Wallet, TrendingUp } from "lucide-react";
import { format } from "date-fns";

export default async function EmployeePayrollPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) redirect("/login");

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user?.employeeProfile) redirect("/login");

  const payslips = await db.payslip.findMany({
    where: { employeeProfileId: user.employeeProfile.id },
    orderBy: { createdAt: "desc" }
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  const totalYTD = payslips.reduce((sum, p) => sum + p.netSalary, 0);
  const latestPayslip = payslips[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-heading text-slate-900 mb-2">Payroll & Compensation</h1>
        <p className="text-slate-500">View your salary details and download payslips.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Latest Payslip Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center border border-white/10">
              <Wallet className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="font-bold text-lg">Last Pay ({latestPayslip ? format(new Date(latestPayslip.month + "-01"), "MMM yyyy") : "N/A"})</h2>
          </div>

          <div className="relative z-10">
            <p className="text-slate-400 text-sm mb-1">Net Transfer Amount</p>
            <h3 className="text-4xl font-bold mb-6">{latestPayslip ? formatCurrency(latestPayslip.netSalary) : "$0.00"}</h3>
            
            {latestPayslip && (
              <div className="space-y-3 pt-6 border-t border-slate-700">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Basic Salary</span>
                  <span className="font-medium">{formatCurrency(latestPayslip.basicSalary)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Allowances</span>
                  <span className="font-medium text-emerald-400">+{formatCurrency(latestPayslip.allowances)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Deductions</span>
                  <span className="font-medium text-red-400">-{formatCurrency(latestPayslip.deductions)}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* YTD Summary */}
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <TrendingUp className="w-7 h-7" />
          </div>
          <p className="text-slate-500 font-medium mb-1">Year-to-Date Earnings</p>
          <h3 className="text-4xl font-bold text-slate-900 mb-2">{formatCurrency(totalYTD)}</h3>
          <p className="text-sm text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full w-max mt-4">
            Includes Basic, Bonus & Allowances
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <FileText className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-900 text-lg">Payslip History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-100">
                <th className="font-medium p-4 pl-6">Month</th>
                <th className="font-medium p-4">Date Paid</th>
                <th className="font-medium p-4">Net Salary</th>
                <th className="font-medium p-4">Status</th>
                <th className="font-medium p-4 pr-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {payslips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">No payslips generated yet.</td>
                </tr>
              ) : (
                payslips.map(ps => (
                  <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 pl-6 font-bold text-slate-900">{format(new Date(ps.month + "-01"), "MMMM yyyy")}</td>
                    <td className="p-4 text-slate-600">{format(new Date(ps.createdAt), "MMM d, yyyy")}</td>
                    <td className="p-4 font-semibold text-slate-900">{formatCurrency(ps.netSalary)}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded font-bold text-xs uppercase tracking-wider">
                        {ps.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <button className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors">
                        <Download className="w-4 h-4" /> Download PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
