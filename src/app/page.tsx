import { ArrowUpRight, BarChart3, BrainCircuit, CalendarCheck, FileBadge, LayoutDashboard, Mic, ShieldCheck, Users, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function WelcomePage() {
  return (
    <div className="min-h-screen font-sans text-slate-900 bg-white selection:bg-blue-100">
      
      {/* Top Section with Light Purple/Blue Background */}
      <div className="bg-[#f8f9fc] pb-24 rounded-b-[40px] border-b border-slate-200/50">
        
        {/* Navigation Bar */}
        <nav className="w-full">
          <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 relative flex items-center justify-center text-blue-600">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold tracking-tight text-blue-900">AITalent-HR</span>
            </div>
            
            {/* Nav Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-500">
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Platform</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Solutions</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Resources</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">Pricing</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                Login
              </Link>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 px-5 rounded shadow-sm transition-colors">
                Get Started
              </Link>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="max-w-[1000px] mx-auto px-6 pt-16 flex flex-col items-center text-center">
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/50 border border-blue-200/50 text-blue-700 mb-8">
            <SparklesIcon />
            <span className="text-[11px] font-bold tracking-wider uppercase">Next-Gen Enterprise HRMS</span>
          </div>

          <h1 className="text-5xl md:text-[56px] font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
            AI-Powered Workforce Management & <br /> Recruitment Platform
          </h1>

          <p className="max-w-2xl text-[17px] text-slate-600 leading-relaxed mb-10">
            Transform complex organizational data into intuitive, actionable insights. 
            Effortlessly control your entire HR lifecycle from intelligent screening to real-time performance analytics with high-precision AI.
          </p>

          <div className="flex items-center gap-4">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 px-8 rounded shadow-sm transition-colors">
              Get Started
            </Link>
            <Link href="/login" className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-sm font-semibold py-3 px-8 rounded shadow-sm transition-colors">
              Book a Demo
            </Link>
          </div>

          {/* Browser Mockup */}
          <div className="mt-20 w-full max-w-[900px] bg-white rounded-t-xl border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="h-10 border-b border-slate-100 flex items-center px-4 gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>
            <div className="p-8 bg-slate-50/50 min-h-[300px]">
              <div className="grid grid-cols-3 gap-6 h-full">
                <div className="col-span-1 h-32 bg-white rounded-lg border-l-2 border-indigo-200 border border-y-slate-100 border-r-slate-100 shadow-sm" />
                <div className="col-span-1 h-32 bg-white rounded-lg border border-slate-100 shadow-sm" />
                <div className="col-span-1 h-32 bg-white rounded-lg border border-slate-100 shadow-sm" />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Stats Section */}
      <section className="border-b border-slate-200">
        <div className="max-w-[1200px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100 text-center">
          <div>
            <div className="text-4xl font-bold text-blue-700 mb-2">5000+</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employees Managed</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-purple-600 mb-2">95%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Faster Hiring</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-teal-600 mb-2">100%</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">AI Powered Decisions</div>
          </div>
          <div className="flex flex-col items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-blue-600 mb-2" />
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Enterprise Ready</div>
          </div>
        </div>
      </section>

      {/* Ecosystem Section */}
      <section className="bg-[#fafbfc] py-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">A complete ecosystem for modern HR</h2>
            <p className="text-slate-600 max-w-2xl leading-relaxed">
              Leverage high-density information presented with absolute clarity. Our suite integrates AI 
              seamlessly to automate workflows and empower your human capital decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            
            {/* Card 1 */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1 bg-white rounded-xl border border-slate-200 border-l-[3px] border-l-blue-600 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="mb-6">
                <FileBadge className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Resume Screening</h3>
              <p className="text-xs text-slate-500 leading-relaxed relative z-10">
                Instantly parse and rank thousands of applications using natural language processing to identify top candidates with precision.
              </p>
              <div className="absolute right-[-20px] bottom-[-20px] opacity-5">
                <FileBadge className="w-32 h-32" />
              </div>
            </div>

            {/* Card 2 */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="flex justify-between items-start mb-6">
                <LayoutDashboard className="w-6 h-6 text-blue-500" />
                <ArrowUpRight className="w-4 h-4 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Real-Time Dashboards</h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                Live visualization of organizational health, diversity metrics, and retention risks across all departments.
              </p>
            </div>

            {/* Card 3 */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 border-l-[3px] border-l-purple-500 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <Mic className="w-6 h-6 text-purple-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Voice Interviews</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Automated initial phone screens with conversational AI that assesses communication skills.
              </p>
            </div>

            {/* Card 4 */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <Users className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Recruitment Automation</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                End-to-end workflow automation from requisition to offer letter generation.
              </p>
            </div>

            {/* Card 5 */}
            <div className="col-span-1 md:col-span-2 bg-white rounded-xl border border-slate-200 border-l-[3px] border-l-blue-400 p-6 shadow-sm hover:shadow-md transition-shadow relative">
              <div className="mb-6">
                <BarChart3 className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Performance Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Predictive modeling to identify high-potentials and flight risks based on continuous feedback data.
              </p>
              {/* Decorative line chart */}
              <div className="absolute bottom-6 left-6 right-6 h-0.5 border-t border-dashed border-slate-200 flex justify-between items-center px-4">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              </div>
            </div>

            {/* Card 6 */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Employee Management</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Centralized repository for all staff records, compliance documents, and assets.
              </p>
            </div>

            {/* Card 7 */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <Wallet className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Payroll</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Error-free, automated compensation cycles integrated with global tax engines.
              </p>
            </div>

            {/* Card 8 */}
            <div className="col-span-1 bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="mb-6">
                <CalendarCheck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Attendance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Smart time-tracking and leave management with geofencing capabilities.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#eff1f5] border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 text-blue-600 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-blue-900">AITalent-HR</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
              The enterprise standard for intelligent workforce management.
            </p>
            <div className="flex gap-4 text-slate-400">
              <div className="w-6 h-6 bg-slate-300 rounded-full" />
              <div className="w-6 h-6 bg-slate-300 rounded-full" />
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="hover:text-blue-600 cursor-pointer">Features</li>
              <li className="hover:text-blue-600 cursor-pointer">Integrations</li>
              <li className="hover:text-blue-600 cursor-pointer">Security</li>
              <li className="hover:text-blue-600 cursor-pointer">Pricing</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="hover:text-blue-600 cursor-pointer">Documentation</li>
              <li className="hover:text-blue-600 cursor-pointer">Blog</li>
              <li className="hover:text-blue-600 cursor-pointer">Case Studies</li>
              <li className="hover:text-blue-600 cursor-pointer">API Reference</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3 text-xs text-slate-600">
              <li className="hover:text-blue-600 cursor-pointer">About Us</li>
              <li className="hover:text-blue-600 cursor-pointer">Careers</li>
              <li className="hover:text-blue-600 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-blue-600 cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
          <p>© 2024 AITalent-HR. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparklesIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
    </svg>
  );
}
