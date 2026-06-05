import { db } from "@/lib/prisma";
import { Users, UserCheck, Briefcase, TrendingUp } from "lucide-react";
import Image from "next/image";

import { createClient } from "@/utils/supabase/server";

export default async function ManagerDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return <div>Not authenticated</div>;
  }

  const managerProfile = await db.employeeProfile.findFirst({
    where: { user: { email: user.email } },
    include: {
      directReports: {
        include: {
          user: true,
          attendances: {
            where: { date: new Date(2026, 4, 20) } // specific day to check 'today' attendance
          }
        }
      }
    }
  });

  if (!managerProfile) return <div>Manager profile not found</div>;

  const teamSize = managerProfile.directReports.length;
  
  // Calculate attendance % for the demo (mocking "today's" attendance)
  const presentToday = managerProfile.directReports.filter(emp => 
    emp.attendances.length > 0 && emp.attendances[0].status === "PRESENT"
  ).length;
  const attendancePct = teamSize > 0 ? Math.round((presentToday / teamSize) * 100) : 0;

  // Mock values for the hackathon
  const teamPerformance = 92;
  const openPositions = 2;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Analytics</h1>
        <p className="text-slate-500 mt-2">Overview of your direct reports and team performance.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Team Size</p>
            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{teamSize}</h3>
            <p className="text-sm text-slate-500 mt-1">Direct reports</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Team Attendance</p>
            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{attendancePct}%</h3>
            <p className="text-sm text-slate-500 mt-1">Present today</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Performance Score</p>
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{teamPerformance}%</h3>
            <p className="text-sm text-slate-500 mt-1">Avg AI review score</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Open Positions</p>
            <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-rose-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-bold text-slate-900">{openPositions}</h3>
            <p className="text-sm text-slate-500 mt-1">Active job postings</p>
          </div>
        </div>
      </div>

      {/* Direct Reports Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-slate-900">Direct Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Employee</th>
                <th className="px-6 py-4 font-medium">Employee ID</th>
                <th className="px-6 py-4 font-medium">Designation</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {managerProfile.directReports.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center">
                        <span className="text-slate-500 font-medium">{emp.user.name?.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{emp.user.name}</p>
                        <p className="text-xs text-slate-500">{emp.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-700 font-medium">{emp.employeeId}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-700">
                    {emp.designation || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                      emp.employmentStatus === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {emp.employmentStatus}
                    </span>
                  </td>
                </tr>
              ))}
              {managerProfile.directReports.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    No direct reports found.
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
