"use client";

import React from "react";
import Sidebar from "./sidebar";
import Header from "./header";
import { useDashboard } from "./DashboardProvider";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  user: any;
}

export default function DashboardLayoutWrapper({ children, user }: DashboardLayoutWrapperProps) {
  const { isSidebarOpen, closeSidebar } = useDashboard();

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
