import { db } from "@/lib/prisma";
import { Users, Target, Activity, TrendingUp, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function SeniorManagerDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Department Overview</h1>
          <p className="text-slate-500 mt-1">Monitor team performance, headcounts, and active recruitment pipelines.</p>
        </div>
        <Button variant="outline" className="text-slate-700 bg-white border-slate-200">
          <Calendar className="w-4 h-4 mr-2" /> Q3 2026 Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { title: "Total Headcount", value: "142", change: "+12", icon: Users, color: "text-blue-600", bg: "bg-blue-100" },
          { title: "Open Requisitions", value: "8", change: "-2", icon: Target, color: "text-amber-600", bg: "bg-amber-100" },
          { title: "Team Productivity", value: "94%", change: "+3%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-100" },
          { title: "Leave Requests", value: "5", change: "Action Needed", icon: Activity, color: "text-rose-600", bg: "bg-rose-100" },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-medium text-slate-500">{stat.title}</p>
            <div className="flex items-end justify-between mt-1">
              <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
              <span className={`text-xs font-semibold ${stat.change.includes('+') ? 'text-emerald-600' : stat.change.includes('-') ? 'text-amber-600' : 'text-rose-600'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment Approvals */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Pending Hiring Approvals</h2>
            <Button variant="ghost" size="sm" className="text-indigo-600">View Pipeline</Button>
          </div>
          <div className="p-0">
            <div className="divide-y divide-slate-100">
              {[
                { role: "Senior Frontend Engineer", candidate: "Alice Chen", score: "92%", status: "AI Recommended" },
                { role: "DevOps Specialist", candidate: "Marcus Johnson", score: "88%", status: "AI Recommended" },
              ].map((item, idx) => (
                <div key={idx} className="p-6 hover:bg-slate-50 flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">{item.candidate}</h4>
                    <p className="text-sm text-slate-500">{item.role}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm font-bold text-emerald-600">{item.score} Match</p>
                      <p className="text-xs text-slate-400">{item.status}</p>
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">Approve Offer</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Alerts */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl"></div>
          
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> Manager Alerts
          </h2>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-xl border border-white/5 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-white">Annual Reviews Due</h4>
              <p className="text-xs text-slate-300 mt-1">You have 4 direct reports needing Q3 performance reviews by Friday.</p>
              <Button size="sm" variant="link" className="text-indigo-300 px-0 mt-2 h-auto text-xs">Start Reviews &rarr;</Button>
            </div>
            
            <div className="p-4 bg-white/10 rounded-xl border border-white/5 backdrop-blur-sm">
              <h4 className="text-sm font-semibold text-white">Budget Variance</h4>
              <p className="text-xs text-slate-300 mt-1">Engineering Q3 software budget is currently 15% over allocated limits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
