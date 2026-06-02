import { db } from "@/lib/prisma";
import { ArrowLeft, Mail, Phone, MapPin, Building, Briefcase, Calendar, Clock, Wallet, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { format, intervalToDuration } from "date-fns";
import LeaveApprovalButtons from "./LeaveApprovalButtons";

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Fetch real employee data with all relations from Prisma
  const user = await db.user.findUnique({
    where: { id: id },
    include: {
      employeeProfile: {
        include: {
          department: true,
          leaveRequests: {
            orderBy: { createdAt: "desc" }
          },
          attendances: {
            orderBy: { date: "desc" },
            take: 10
          },
          payslips: {
            orderBy: { month: "desc" }
          }
        }
      }
    }
  });

  if (!user || user.role === "ADMIN") {
    notFound();
  }

  const profile = user.employeeProfile;

  const joiningDateFormatted = profile?.joiningDate 
    ? format(new Date(profile.joiningDate), "MMM dd, yyyy")
    : "N/A";
    
  const salaryFormatted = profile?.salary 
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(profile.salary)
    : "N/A";

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Back Navigation */}
      <Link href="/admin/employees" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Back to Employees List
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start md:items-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-3xl font-bold shadow-xs">
          {user.image ? (
            <img src={user.image} alt={user.name || "Employee"} className="w-full h-full rounded-full object-cover" />
          ) : (
            user.name?.charAt(0) || "E"
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-transparent text-xs font-semibold py-0.5">
              {profile?.employmentStatus || "ACTIVE"}
            </Badge>
          </div>
          <p className="text-sm text-slate-500 font-semibold flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-slate-400" />
            {profile?.designation || "Team Member"} • {profile?.department?.name || "Corporate"}
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Contact Info */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Contact Information</h3>
          
          <div className="space-y-3.5 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500">Email:</span>
              <a href={`mailto:${user.email}`} className="font-bold text-slate-700 hover:text-blue-600 hover:underline">{user.email}</a>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500">Phone:</span>
              <span className="font-bold text-slate-700">{profile?.contactNumber || "Not Provided"}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500">Address:</span>
              <span className="font-bold text-slate-700">{profile?.address || "Not Provided"}</span>
            </div>
          </div>
        </div>

        {/* Employment Details */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-2">Employment Details</h3>
          
          <div className="space-y-3.5 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Building className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500">Employee ID:</span> 
              <span className="font-bold text-slate-700">{profile?.employeeId || "EMP-N/A"}</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500">Joining Date:</span> 
              <span className="font-bold text-slate-700">{joiningDateFormatted}</span>
            </div>
            <div className="flex items-center gap-3">
              <Wallet className="w-5 h-5 text-slate-400 shrink-0" />
              <span className="font-medium text-slate-500">Base Salary:</span> 
              <span className="font-bold text-slate-700">{salaryFormatted}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leave Management section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Calendar className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-800 text-lg">Leave Requests History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Leave Type</th>
                <th className="px-6 py-3.5">Start Date</th>
                <th className="px-6 py-3.5">End Date</th>
                <th className="px-6 py-3.5">Reason</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profile?.leaveRequests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{req.type}</td>
                  <td className="px-6 py-4 text-slate-600">{format(new Date(req.startDate), "MMM dd, yyyy")}</td>
                  <td className="px-6 py-4 text-slate-600">{format(new Date(req.endDate), "MMM dd, yyyy")}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-[200px]" title={req.reason || ""}>{req.reason || "-"}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                      req.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {req.status === "PENDING" ? (
                      <LeaveApprovalButtons leaveRequestId={req.id} />
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">No actions</span>
                    )}
                  </td>
                </tr>
              ))}
              
              {(!profile || profile.leaveRequests.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No leave requests found for this employee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attendance log section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Clock className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-800 text-lg">Attendance Log (Last 10 Days)</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Clock In</th>
                <th className="px-6 py-3.5">Clock Out</th>
                <th className="px-6 py-3.5">Hours Worked</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profile?.attendances.map((att) => {
                const inTime = att.clockIn ? new Date(att.clockIn) : null;
                const outTime = att.clockOut ? new Date(att.clockOut) : null;
                
                let durationStr = "-";
                if (inTime && outTime) {
                  const dur = intervalToDuration({ start: inTime, end: outTime });
                  durationStr = `${dur.hours || 0}h ${dur.minutes || 0}m`;
                }

                return (
                  <tr key={att.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-slate-800">{format(new Date(att.date), "MMM dd, yyyy")}</td>
                    <td className="px-6 py-4 text-slate-600">{inTime ? format(inTime, "h:mm a") : "-"}</td>
                    <td className="px-6 py-4 text-slate-600">{outTime ? format(outTime, "h:mm a") : "-"}</td>
                    <td className="px-6 py-4 font-bold text-blue-600">{durationStr}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        att.status === 'PRESENT' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              
              {(!profile || profile.attendances.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No attendance records found for this employee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payroll / Payslip section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
          <Wallet className="w-5 h-5 text-slate-400" />
          <h2 className="font-bold text-slate-800 text-lg">Payslip History</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Basic Salary</th>
                <th className="px-6 py-3.5">Allowances</th>
                <th className="px-6 py-3.5">Deductions</th>
                <th className="px-6 py-3.5">Net Salary</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profile?.payslips.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-800">{pay.month}</td>
                  <td className="px-6 py-4 text-slate-600">${pay.basicSalary.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">${pay.allowances.toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-600">${pay.deductions.toLocaleString()}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">${pay.netSalary.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-800">
                      {pay.status}
                    </span>
                  </td>
                </tr>
              ))}
              
              {(!profile || profile.payslips.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No payslips generated yet for this employee.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
