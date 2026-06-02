"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { Bell, Search, Menu, ChevronDown, User, LogOut, Calendar } from 'lucide-react';
import { useDashboard } from './DashboardProvider';
import Link from 'next/link';

export default function Header({ user }: { user?: any }) {
  const { isSidebarOpen, toggleSidebar } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  // Determine profile route based on user role
  const profileHref = 
    user?.role === 'ADMIN' || user?.role === 'MANAGEMENT' ? '/admin' :
    user?.role === 'HR_RECRUITER' ? '/hr' :
    user?.role === 'SENIOR_MANAGER' ? '/manager' :
    '/employee';

  const joiningDateFormatted = user?.employeeProfile?.joiningDate 
    ? format(new Date(user.employeeProfile.joiningDate), 'MMM dd, yyyy')
    : "N/A";

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-10">
      
      <div className="flex items-center gap-4">
        {/* Hamburger Toggle - Only show in header when sidebar is closed on desktop, or always on mobile */}
        {!isSidebarOpen && (
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search Bar */}
        <div className="hidden md:flex items-center w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search candidates, jobs, or employees..." 
            className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-6 border-l border-slate-200 group hover:opacity-90 transition-all duration-200 cursor-pointer focus:outline-none"
          >
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-700 group-hover:text-blue-600 transition-colors duration-200">
                {user?.name || "System User"}
              </div>
              <div className="text-xs text-slate-500 flex items-center justify-end gap-1">
                <span>{user?.role?.replace('_', ' ') || "ROLE_NOT_FOUND"}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
              </div>
            </div>
            {user?.image ? (
              <img src={user.image} alt="Avatar" className="w-10 h-10 rounded-full object-cover border border-blue-200 group-hover:border-blue-300 transition-all duration-200 shadow-sm group-hover:scale-105" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-700 group-hover:text-blue-800 font-bold border border-blue-200 group-hover:border-blue-300 transition-all duration-200 shadow-sm group-hover:scale-105">
                {user?.name?.[0] || "U"}
              </div>
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden transition-all duration-200 ease-out origin-top-right animate-in fade-in slide-in-from-top-2">
              {/* Profile Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
                {user?.image ? (
                  <img src={user.image} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-white shadow-md">
                    {user?.name?.[0] || "U"}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2 truncate">
                    <span className="truncate">{user?.name || "System User"}</span>
                    <span className="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                      {user?.employeeProfile?.employmentStatus || "ACTIVE"}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-500 truncate">{user?.email || "no-email@example.com"}</p>
                </div>
              </div>

              {/* Corporate Details */}
              <div className="p-5 border-b border-slate-100 space-y-3.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Employment Profile</div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-slate-400 font-medium mb-0.5">Employee ID</div>
                    <div className="font-semibold text-slate-700 truncate">{user?.employeeProfile?.employeeId || "EMP-N/A"}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-medium mb-0.5">Department</div>
                    <div className="font-semibold text-slate-700 truncate">{user?.employeeProfile?.department?.name || "N/A"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-400 font-medium mb-0.5">Designation</div>
                    <div className="font-semibold text-slate-700 truncate">{user?.employeeProfile?.designation || "N/A"}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-slate-400 font-medium mb-0.5">Joining Date</div>
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {joiningDateFormatted}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-2 bg-slate-50/50">
                <Link 
                  href="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-blue-600 hover:bg-white border border-transparent hover:border-slate-100 transition-all shadow-sm"
                >
                  <User className="w-4 h-4 text-slate-400 shrink-0" />
                  View Profile
                </Link>

                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 w-full px-3 py-2 mt-1 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
