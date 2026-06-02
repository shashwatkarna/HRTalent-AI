"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useDashboard } from "./DashboardProvider";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
}

export default function DashboardLayoutWrapper({ children, user }: DashboardLayoutWrapperProps) {
  const { isSidebarOpen, closeSidebar } = useDashboard();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    let targetRoute = "/employee";
    let isPathValid = false;

    if (user.role === "ADMIN" || user.role === "MANAGEMENT") {
      targetRoute = "/admin";
      isPathValid = pathname.startsWith("/admin");
    } else if (user.role === "HR_RECRUITER") {
      targetRoute = "/hr";
      isPathValid = pathname.startsWith("/hr");
    } else if (user.role === "SENIOR_MANAGER") {
      targetRoute = "/manager";
      isPathValid = pathname.startsWith("/manager");
    } else {
      targetRoute = "/employee";
      isPathValid = pathname.startsWith("/employee");
    }

    if (!isPathValid) {
      // Use replace instead of push so they don't get stuck in a back-button loop
      router.replace(targetRoute);
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, user.role, router]);

  // Prevent rendering the dashboard content if they are on the wrong route
  if (!isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-slate-500 font-medium">Verifying access...</span>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Component handles its own translate logic based on isSidebarOpen */}
      <Sidebar role={user.role} />
      
      {/* Main Content Area - Smoothly glides left or right based on Sidebar state */}
      <div 
        className={`flex-1 flex flex-col min-w-0 h-screen transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "md:ml-64" : "ml-0"
        }`}
      >
        <Header user={user} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
