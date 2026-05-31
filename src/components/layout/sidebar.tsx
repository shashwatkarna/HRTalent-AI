import Link from 'next/link';
import { Home, Users, CalendarDays, FileText, Settings, UserPlus, LogOut } from 'lucide-react';

export default function Sidebar() {
  // Hardcoded for now. In Phase 2, this will be dynamic based on the user's role.
  const menuItems = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Employees', href: '/admin/employees', icon: Users },
    { name: 'Attendance', href: '/admin/attendance', icon: CalendarDays },
    { name: 'Leave Requests', href: '/admin/leave', icon: FileText },
    { name: 'Recruitment', href: '/hr', icon: UserPlus },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed top-0 left-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 font-bold text-xl tracking-tight">
        HRTalent<span className="text-blue-500">AI</span>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
            >
              <Icon className="w-5 h-5 text-slate-400 group-hover:text-blue-400" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile / Logout (Placeholder) */}
      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all">
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
