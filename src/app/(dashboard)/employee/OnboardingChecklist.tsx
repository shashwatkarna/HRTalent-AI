"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, ChevronRight, BookOpen, FileSignature, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingChecklist({ employeeName }: { employeeName: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: "Read Company Handbook", icon: BookOpen, completed: false },
    { id: 2, title: "Sign Non-Disclosure Agreement", icon: FileSignature, completed: false },
    { id: 3, title: "Set up Direct Deposit", icon: Wallet, completed: false },
  ]);

  useEffect(() => {
    const hasCompleted = localStorage.getItem("onboarding_completed");
    if (!hasCompleted) {
      setIsVisible(true);
    }
  }, []);

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const completeOnboarding = () => {
    localStorage.setItem("onboarding_completed", "true");
    setIsVisible(false);
  };

  const allCompleted = tasks.every(t => t.completed);

  if (!isVisible) return null;

  return (
    <div className="mb-8 p-1 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
      <div className="bg-white rounded-xl p-8 shadow-inner relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex-1 space-y-4">
            <div className="inline-block px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider mb-2">
              Action Required
            </div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Welcome aboard, {employeeName}! 🎉
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed max-w-xl">
              We're thrilled to have you join the team. Let's get you set up. Please complete these final onboarding steps to unlock your full dashboard.
            </p>
            
            <div className="pt-4">
              <Button 
                onClick={completeOnboarding} 
                disabled={!allCompleted}
                size="lg"
                className={`transition-all duration-300 font-bold ${
                  allCompleted 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/25 shadow-lg scale-105" 
                    : "bg-slate-100 text-slate-400 cursor-not-allowed hover:bg-slate-100"
                }`}
              >
                {allCompleted ? (
                  <>Complete Onboarding <ChevronRight className="w-5 h-5 ml-2" /></>
                ) : (
                  "Complete all tasks to continue"
                )}
              </Button>
            </div>
          </div>
          
          <div className="w-full md:w-[400px] flex-shrink-0 bg-slate-50 border border-slate-100 rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
              <span>Your Checklist</span>
              <span className="text-xs px-2 py-1 bg-white border border-slate-200 rounded-md shadow-sm">
                {tasks.filter(t => t.completed).length} / {tasks.length}
              </span>
            </h3>
            
            <div className="space-y-3">
              {tasks.map(task => {
                const Icon = task.icon;
                return (
                  <div 
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`flex items-center gap-4 p-3 rounded-lg border transition-all cursor-pointer group ${
                      task.completed 
                        ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-sm'
                    }`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                      task.completed ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                    }`}>
                      {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span className={`font-medium flex-1 transition-colors ${
                      task.completed ? 'text-emerald-700 line-through opacity-80' : 'text-slate-700 group-hover:text-indigo-700'
                    }`}>
                      {task.title}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
