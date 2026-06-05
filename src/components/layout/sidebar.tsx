"use client";
import { useState } from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, CalendarDays, FileText, Settings, UserPlus, 
  BrainCircuit, LayoutDashboard, BarChart3, Clock, Wallet, Mic, Search, Menu, Sparkles, Bot, UserCircle
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useDashboard } from './DashboardProvider';

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isSidebarOpen, toggleSidebar } = useDashboard();

  const [isSelfServiceOpen, setIsSelfServiceOpen] = useState(false);

  let menuItems: any[] = [];

  const employeeFeatures = [
    { name: 'My Attendance', href: '/employee/attendance', icon: Clock },
    { name: 'My Leave', href: '/employee/leave', icon: CalendarDays },
    { name: 'My Payslips', href: '/employee/payroll', icon: Wallet },
    { name: 'AI HR Copilot', href: '/employee/ai-assistant', icon: Bot },
  ];

  if (role === 'ADMIN' || role === 'MANAGEMENT') {
    menuItems = [
      { name: 'Overview', href: '/admin', icon: LayoutDashboard },
      { name: 'Employees', href: '/admin/employees', icon: Users },
      { name: 'Company Directory', href: '/directory', icon: Users },
      { name: 'AI Governance', href: '/admin/governance', icon: BrainCircuit },
      { name: 'Global Payroll', href: '/admin/payroll', icon: Wallet },
      { name: 'Company Analytics', href: '/admin/analytics', icon: BarChart3 },
    ];
  } else if (role === 'HR_RECRUITER') {
    menuItems = [
      { name: 'Recruitment', href: '/hr', icon: Search },
      { name: 'Jobs', href: '/hr/jobs', icon: FileText },
      { name: 'Candidates', href: '/hr/candidates', icon: Users },
      { name: 'Voice Interviews', href: '/hr/interviews', icon: Mic },
      { name: 'Offers & Approvals', href: '/hr/offers', icon: FileText },
      { name: 'Action Requests', href: '/hr/requests', icon: Settings },
      { name: 'AI Screening', href: '/hr/upload', icon: BrainCircuit },
      { name: 'Company Directory', href: '/directory', icon: Users },
    ];
  } else if (role === 'SENIOR_MANAGER') {
    menuItems = [
      { name: 'Team Analytics', href: '/manager', icon: BarChart3 },
      { name: 'Recruitment', href: '/manager/recruitment', icon: Search },
      { name: 'Approvals', href: '/manager/approvals', icon: CalendarDays },
      { name: 'Reviews', href: '/manager/reviews', icon: FileText },
      { name: 'Company Directory', href: '/directory', icon: Users },
    ];
  } else {
    // EMPLOYEE
    menuItems = [
      { name: 'My Profile', href: '/employee', icon: Home },
      { name: 'Company Directory', href: '/directory', icon: Users },
      ...employeeFeatures
    ];
  }

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <aside 
      className={`w-64 bg-slate-900 text-slate-100 flex flex-col h-screen fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 font-bold text-xl tracking-tight gap-2 font-heading">
        <div className="flex items-center gap-2">
          <Image src="/logo.png" alt="AITalent HR Logo" width={32} height={32} className="object-contain" />
          AITalent<span className="text-slate-400 font-normal text-sm">HR</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="p-1 -mr-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="px-6 py-4 border-b border-slate-800">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Current Portal</div>
        <div className="text-sm font-medium text-blue-400">{role.replace('_', ' ')}</div>
      </div>

      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group ${
                isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}

        {role !== 'EMPLOYEE' && (
          <div className="pt-4 mt-4 border-t border-slate-800">
            <button 
              onClick={() => setIsSelfServiceOpen(!isSelfServiceOpen)}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-all group"
            >
              <div className="flex items-center gap-3">
                <UserCircle className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300" />
                <span className="font-medium text-sm">Self Service</span>
              </div>
              <span className="text-xs text-slate-500">{isSelfServiceOpen ? '▼' : '▶'}</span>
            </button>
            
            {isSelfServiceOpen && (
              <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
                {employeeFeatures.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={item.name} 
                      href={item.href}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all group ${
                        isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-indigo-400'}`} />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium text-sm">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
