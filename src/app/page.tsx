"use client";

import { useState } from "react";
import { 
  ArrowUpRight, BarChart3, BrainCircuit, CalendarCheck, FileBadge, 
  LayoutDashboard, Mic, ShieldCheck, Users, Wallet, Menu, X, 
  ChevronRight, CheckCircle2, UserCheck, RefreshCw, ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import MermaidDiagram from "@/components/MermaidDiagram";

const ARCHITECTURE_CHART = `
graph TD
    %% Core Architecture
    User([User / Candidate]) -->|HTTPS| Vercel[Next.js Frontend]
    User -->|WSS| Railway[Python FastAPI Backend]
    
    subgraph "Vercel (Next.js App Router)"
        UI[UI Components] -->|Prisma ORM| SupabaseDB[(Supabase PostgreSQL)]
        UI -->|Auth API| SupabaseAuth[Supabase Auth]
    end
    
    subgraph "RBAC (Role-Based Access Control)"
        SupabaseAuth -->|Role: ADMIN| Admin[Governance & Payroll]
        SupabaseAuth -->|Role: MANAGER| Manager[Reviews & Jobs]
        SupabaseAuth -->|Role: HR| HRRole[Recruitment & Interviews]
        SupabaseAuth -->|Role: EMPLOYEE| Employee[Profile & HR Chatbot]
    end
    
    subgraph "Railway (Python AI Backend)"
        VoiceService[Socket.io Streaming] -->|Faster-Whisper| Transcribe[Audio -> Text]
        Transcribe -->|API Calls| Gemini[Google Gemini 2.5 Flash]
        Gemini -->|Text -> Audio| VoiceService
    end
    
    Vercel -.->|Fetches AI JD| Gemini
`;

export default function WelcomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen font-sans text-slate-900 bg-slate-50 selection:bg-blue-100 overflow-x-hidden">
      
      {/* Top Section with Modern Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#f0f4fd] via-[#f8faff] to-white pb-20 md:pb-32">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="absolute top-40 -left-40 w-[500px] h-[500px] rounded-full bg-purple-100/40 blur-3xl" />
        </div>

        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 w-full z-[100] bg-white/70 backdrop-blur-md border-b border-slate-200/50 shadow-sm rounded-b-xl transition-all">
          <div className="max-w-[1200px] mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="AITalent HR Logo" width={40} height={40} className="object-contain" />
              <span className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-heading">
                AITalent<span className="text-blue-600">HR</span>
              </span>
            </div>
            
            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
              <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
              <a href="#platform" className="hover:text-blue-600 transition-colors">How It Works</a>
              <a href="#metrics" className="hover:text-blue-600 transition-colors">Metrics</a>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors">
                Log in
              </Link>
              <Link href="/login" className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-6 rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5">
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger Toggle */}
            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden absolute top-20 left-0 w-full bg-white border-b border-slate-200 shadow-xl p-4 flex flex-col gap-4 animate-in slide-in-from-top-2 rounded-b-xl">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg">Features</a>
              <a href="#platform" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg">How It Works</a>
              <a href="#metrics" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-700 font-medium hover:bg-slate-50 rounded-lg">Metrics</a>
              <div className="h-px bg-slate-100 my-2" />
              <Link href="/login" className="px-4 py-3 text-center font-bold text-blue-600">Log in</Link>
              <Link href="/login" className="px-4 py-3 bg-blue-600 text-white text-center font-bold rounded-lg shadow-sm">Get Started</Link>
            </div>
          )}
        </nav>

        {/* Hero Section */}
        <main className="relative z-10 max-w-[1000px] mx-auto px-4 md:px-6 pt-32 md:pt-40 flex flex-col items-center text-center">
          
          <h1 className="font-heading text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6 md:mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100">
            Hire Smarter.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              Manage Better.
            </span>
          </h1>

          <p className="max-w-2xl text-lg md:text-xl text-slate-600 leading-relaxed mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            The all-in-one AI platform that transforms how you screen candidates, manage employee data, and analyze workforce performance.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-base font-semibold py-4 px-8 rounded-full shadow-lg shadow-blue-600/25 transition-all hover:shadow-xl hover:-translate-y-1">
              Start Building Team
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="#features" className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-base font-semibold py-4 px-8 rounded-full shadow-sm transition-all hover:-translate-y-1">
              See How It Works
            </Link>
          </div>
        </main>
      </div>

      {/* Ecosystem Section (Features) */}
      <section id="features" className="bg-white py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-16 md:text-center flex flex-col md:items-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">The ultimate HR ecosystem.</h2>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Replace outdated spreadsheets with a beautifully unified dashboard. From intelligent AI resume parsing to automated payroll, we have you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Core Feature 1 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileBadge className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">AI Resume Screening</h3>
              <p className="text-slate-500 leading-relaxed">
                Instantly parse and rank thousands of applications using our proprietary NLP algorithms to find your ideal candidate.
              </p>
            </div>

            {/* Core Feature 2 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all group">
              <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Voice Interviews</h3>
              <p className="text-slate-500 leading-relaxed">
                Automated phone screens conducted by our AI assistant, analyzing communication skills and technical knowledge.
              </p>
            </div>

            {/* Core Feature 3 */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Smart Payroll</h3>
              <p className="text-slate-500 leading-relaxed">
                Error-free automated compensation cycles directly tied to attendance and performance metrics.
              </p>
            </div>

            {/* Wide Feature */}
            <div className="md:col-span-2 lg:col-span-3 bg-slate-900 rounded-3xl p-8 md:p-12 border border-slate-800 shadow-xl overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-400 mb-6">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-semibold tracking-wide uppercase">Enterprise Governance</span>
                </div>
                <h3 className="font-heading text-3xl font-bold text-white mb-4">Total Transparency</h3>
                <p className="text-slate-400 leading-relaxed text-lg mb-8">
                  Every AI decision is logged in the Governance Panel. Understand exactly why a candidate was ranked highly or rejected, ensuring unbiased and fair hiring practices.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Granular Access Control
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Real-time Audit Logs
                  </li>
                  <li className="flex items-center gap-3 text-white font-medium">
                    <CheckCircle2 className="w-5 h-5 text-blue-500" /> Compliance Reporting
                  </li>
                </ul>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Technical Architecture Pipeline (How) */}
      <section id="platform" className="bg-slate-50 py-20 md:py-32">
        <div className="max-w-[1200px] mx-auto px-4 md:px-6">
          <div className="w-full bg-slate-900 p-8 md:p-12 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
            {/* Abstract Background Grid for Tech Feel */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20"></div>

            <div className="relative z-10 text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-4 text-xs font-bold uppercase tracking-widest">
                <BrainCircuit className="w-4 h-4" /> Real-time Architecture
              </div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">How the AI Engine Works</h2>
              <p className="text-slate-400 max-w-2xl mx-auto">A sub-500ms latency pipeline powered by WebSockets, capturing audio, analyzing sentiment, and evaluating technical skills in real-time.</p>
            </div>
            
            {/* Architecture Diagram - Full Mermaid Version */}
            <div className="relative z-10 w-full mt-12">
              <MermaidDiagram chart={ARCHITECTURE_CHART} />
            </div>


          </div>
        </div>
      </section>

      {/* Stats Section (Metrics) */}
      <section id="metrics" className="border-t border-b border-slate-200 bg-white">
        <div className="max-w-[1200px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x divide-slate-100 text-center">
          <div className="p-4 hover:-translate-y-1 transition-transform">
            <div className="font-heading text-4xl md:text-5xl font-extrabold text-slate-900 mb-2">5k+</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Users</div>
          </div>
          <div className="p-4 hover:-translate-y-1 transition-transform">
            <div className="font-heading text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">95%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Faster Screening</div>
          </div>
          <div className="p-4 hover:-translate-y-1 transition-transform">
            <div className="font-heading text-4xl md:text-5xl font-extrabold text-purple-600 mb-2">24/7</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">AI Assistants</div>
          </div>
          <div className="p-4 hover:-translate-y-1 transition-transform">
            <div className="font-heading text-4xl md:text-5xl font-extrabold text-emerald-600 mb-2">100%</div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enterprise Secure</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white pt-16 pb-8">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src="/logo.png" alt="AITalent HR Logo" width={32} height={32} className="object-contain" />
              <span className="text-xl font-bold tracking-tight text-slate-900 font-heading">AITalent<span className="text-blue-600">HR</span></span>
            </div>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-6">
              The enterprise standard for intelligent workforce management and recruitment automation.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="#features" className="hover:text-blue-600 cursor-pointer transition-colors block">Features</Link></li>
              <li><Link href="/hackathon" className="hover:text-blue-600 cursor-pointer transition-colors block">Integrations</Link></li>
              <li><Link href="/hackathon" className="hover:text-blue-600 cursor-pointer transition-colors block">Security</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-4">Resources</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/docs" className="hover:text-blue-600 cursor-pointer transition-colors block">Documentation</Link></li>
              <li><Link href="/hackathon" className="hover:text-blue-600 cursor-pointer transition-colors block">Blog</Link></li>
              <li><Link href="/hackathon" className="hover:text-blue-600 cursor-pointer transition-colors block">Case Studies</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm text-slate-900 mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li><Link href="/hackathon" className="hover:text-blue-600 cursor-pointer transition-colors block">About Us</Link></li>
              <li><Link href="/careers" className="hover:text-blue-600 cursor-pointer transition-colors block">Careers</Link></li>
              <li><Link href="/hackathon" className="hover:text-blue-600 cursor-pointer transition-colors block">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AITalent-HR. All rights reserved.</p>
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
