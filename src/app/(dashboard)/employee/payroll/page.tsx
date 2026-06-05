import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { Wallet, FileText, Download, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default async function EmployeePayrollPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user?.email) {
    return <div>Not authenticated</div>;
  }

  // Find employee profile
  const employee = await db.employeeProfile.findFirst({
    where: { user: { email: user.email } },
    include: {
      payslips: {
        orderBy: { month: 'desc' }
      }
    }
  });

  if (!employee) {
    return <div>No Employee Profile Found</div>;
  }

  // Formatting utilities
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const getMonthName = (monthStr: string) => {
    // monthStr is like "2026-10"
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const latestPayslip = employee.payslips[0];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Payslips</h1>
        <p className="text-slate-500 mt-2">View your salary details and download your monthly payslips.</p>
      </div>

      {latestPayslip ? (
        <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 flex-1">
            <div className="flex items-center gap-2 text-emerald-400 mb-2 font-semibold">
              <Wallet className="w-5 h-5" /> Latest Payroll ({getMonthName(latestPayslip.month)})
            </div>
            <div className="text-5xl font-black tracking-tight mb-4">
              {formatCurrency(latestPayslip.netSalary)}
            </div>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center gap-1 text-slate-300">
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                Gross: {formatCurrency(latestPayslip.basicSalary + latestPayslip.allowances)}
              </div>
              <div className="flex items-center gap-1 text-slate-300">
                <ArrowDownRight className="w-4 h-4 text-rose-400" />
                Deductions: {formatCurrency(latestPayslip.deductions)}
              </div>
            </div>
          </div>

          <button className="relative z-10 bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2">
            <Download className="w-4 h-4" /> Download Payslip
          </button>
        </div>
      ) : (
        <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-12 text-center flex flex-col items-center">
          <DollarSign className="w-12 h-12 text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No Payslips Yet</h3>
          <p className="text-slate-500 mt-2">Your payroll records will appear here once they are processed by the HR department.</p>
        </div>
      )}

      {employee.payslips.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-slate-400" /> Payslip History
            </h3>
          </div>
          
          <div className="divide-y divide-slate-100">
            {employee.payslips.map((payslip) => (
              <div key={payslip.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">{getMonthName(payslip.month)}</h4>
                    <p className="text-slate-500 text-sm">Processed on {new Date(payslip.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-8 bg-slate-50 px-6 py-3 rounded-xl border border-slate-100">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gross</div>
                    <div className="font-semibold text-slate-700">{formatCurrency(payslip.basicSalary + payslip.allowances)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Deductions</div>
                    <div className="font-semibold text-rose-500">-{formatCurrency(payslip.deductions)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Net Pay</div>
                    <div className="font-black text-slate-900 text-lg">{formatCurrency(payslip.netSalary)}</div>
                  </div>
                </div>

                <button className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1">
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
