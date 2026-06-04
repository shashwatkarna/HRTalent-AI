"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { format } from 'date-fns';
import { 
  Bell, Search, Menu, ChevronDown, User, LogOut, Calendar, 
  Wallet, Clock, Brain, Info, Check
} from 'lucide-react';
import { useDashboard } from './DashboardProvider';
import Link from 'next/link';
import SearchBarClient from './SearchBarClient';

interface NotificationItem {
  id: string;
  type: 'leave' | 'payroll' | 'candidate' | 'ai' | 'attendance' | 'system';
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const getNotificationStyles = (type: string) => {
  switch (type) {
    case 'payroll':
      return { bg: 'bg-amber-50/70 text-amber-600', border: 'border-amber-100/50', icon: Wallet };
    case 'leave':
      return { bg: 'bg-emerald-50/70 text-emerald-600', border: 'border-emerald-100/50', icon: Calendar };
    case 'attendance':
      return { bg: 'bg-indigo-50/70 text-indigo-600', border: 'border-indigo-100/50', icon: Clock };
    case 'candidate':
      return { bg: 'bg-blue-50/70 text-blue-600', border: 'border-blue-100/50', icon: User };
    case 'ai':
      return { bg: 'bg-purple-50/70 text-purple-600', border: 'border-purple-100/50', icon: Brain };
    default:
      return { bg: 'bg-slate-100/70 text-slate-600', border: 'border-slate-200/50', icon: Info };
  }
};

const generateNotifications = (user: any): NotificationItem[] => {
  const list: NotificationItem[] = [];

  if (!user) return list;

  if (user.role === 'EMPLOYEE') {
    // 1. Payslip notification
    const payslips = user.employeeProfile?.payslips || [];
    if (payslips.length > 0) {
      list.push({
        id: 'payroll-1',
        type: 'payroll',
        title: 'New Payslip Available',
        description: `Your payslip for ${payslips[0].month} has been generated and is ready for download.`,
        time: '2 hours ago',
        read: false,
      });
    }

    // 2. Leave notification
    const leaveRequests = user.employeeProfile?.leaveRequests || [];
    if (leaveRequests.length > 0) {
      const latest = leaveRequests[0];
      const start = latest.startDate ? new Date(latest.startDate) : null;
      const startStr = start && !isNaN(start.getTime()) ? format(start, 'MMM dd') : '';
      list.push({
        id: 'leave-1',
        type: 'leave',
        title: `Leave Request ${latest.status}`,
        description: `Your ${latest.type.toLowerCase()} leave request starting ${startStr} has been ${latest.status.toLowerCase()}.`,
        time: '1 day ago',
        read: false,
      });
    } else {
      list.push({
        id: 'leave-default',
        type: 'leave',
        title: 'Annual Leave Balance Updated',
        description: 'You have 14 days of available annual leave. Request leave via the Leave portal.',
        time: '3 days ago',
        read: true,
      });
    }

    // 3. Attendance clock in
    list.push({
      id: 'attendance-1',
      type: 'attendance',
      title: 'Clock In Successful',
      description: 'You clocked in successfully today at 9:02 AM. Have a great day!',
      time: '9 hours ago',
      read: true,
    });

    // 4. Welcome notification
    list.push({
      id: 'welcome',
      type: 'system',
      title: 'Welcome to AITalent HR',
      description: 'Explore your dashboard to see payroll records, request leave, or chat with the HR AI assistant.',
      time: '5 days ago',
      read: true,
    });
  } else if (user.role === 'HR_RECRUITER') {
    list.push({
      id: 'candidate-1',
      type: 'candidate',
      title: 'New Candidate Applied',
      description: 'Sarah Jenkins has applied for the Senior Product Designer position.',
      time: '45 mins ago',
      read: false,
    });
    list.push({
      id: 'ai-1',
      type: 'ai',
      title: 'AI Resume Screening Complete',
      description: 'Gemini completed resume analysis for candidate Alex Rivera. Match Score: 92%.',
      time: '3 hours ago',
      read: false,
    });
    list.push({
      id: 'system-recruiter',
      type: 'system',
      title: 'Voice Interview Pipeline Active',
      description: 'AI Voice interviewing agent is ready for the new Software Engineer candidates.',
      time: '1 day ago',
      read: true,
    });
  } else if (user.role === 'ADMIN' || user.role === 'MANAGEMENT') {
    list.push({
      id: 'admin-1',
      type: 'system',
      title: 'AI Governance Model Synced',
      description: 'The internal neural engine has successfully compiled employee compliance reports.',
      time: '1 hour ago',
      read: false,
    });
    list.push({
      id: 'admin-leave',
      type: 'leave',
      title: 'New Leave Approval Request',
      description: 'Employee David Miller has requested 3 days of sick leave starting June 15.',
      time: '4 hours ago',
      read: false,
    });
    list.push({
      id: 'admin-payroll',
      type: 'payroll',
      title: 'Payroll Calculations Locked',
      description: 'Payroll runs for June 2026 have been generated and locked for administrative review.',
      time: '2 days ago',
      read: true,
    });
  } else if (user.role === 'SENIOR_MANAGER') {
    list.push({
      id: 'manager-1',
      type: 'leave',
      title: 'Pending Leave Request',
      description: 'You have a pending leave approval request from John Doe (Software Engineer).',
      time: '30 mins ago',
      read: false,
    });
    list.push({
      id: 'manager-2',
      type: 'system',
      title: 'Team Attendance Summary',
      description: 'Weekly team attendance is at 96.5% with 0 unscheduled absences reported.',
      time: '1 day ago',
      read: true,
    });
  }

  return list;
};

export default function Header({ user }: { user?: any }) {
  const { isSidebarOpen, toggleSidebar } = useDashboard();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (user) {
      setNotifications(generateNotifications(user));
    }
  }, [user]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
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

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
        <SearchBarClient userRole={user?.role} />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        
        {/* Notifications Dropdown */}
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-lg hover:bg-slate-50 focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 overflow-hidden transition-all duration-200 ease-out origin-top-right animate-in fade-in slide-in-from-top-2">
              {/* Notifications Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 focus:outline-none"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark all as read
                  </button>
                )}
              </div>

              {/* Notifications List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                    <Bell className="w-8 h-8 text-slate-300 stroke-1" />
                    <p className="text-xs font-semibold text-slate-700">All caught up!</p>
                    <p className="text-[10px] text-slate-400">No new notifications for you right now.</p>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const styles = getNotificationStyles(item.type);
                    const Icon = styles.icon;
                    return (
                      <div 
                        key={item.id} 
                        onClick={() => markAsRead(item.id)}
                        className={`p-4 flex gap-3 cursor-pointer transition-colors ${item.read ? 'hover:bg-slate-50/50' : 'bg-blue-50/20 hover:bg-blue-50/40'}`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${styles.bg} ${styles.border}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-start gap-1">
                            <h5 className={`text-xs truncate ${item.read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>
                              {item.title}
                            </h5>
                            {!item.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0 mt-1.5"></span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed break-words">{item.description}</p>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1">{item.time}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Notifications Footer */}
              {notifications.length > 0 && (
                <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-center">
                  <button 
                    onClick={clearAll}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 focus:outline-none"
                  >
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Profile Dropdown */}
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
