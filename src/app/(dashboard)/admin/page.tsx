export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
      <p className="text-slate-500">Welcome back! Here's what's happening today.</p>
      
      {/* Placeholder for Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        {[
          { label: "Total Employees", value: "5,241" },
          { label: "Active Roles", value: "84" },
          { label: "New Hires", value: "32" },
          { label: "Pending Leaves", value: "14" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-sm font-medium text-slate-500">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
