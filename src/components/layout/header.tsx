import { Bell, Search } from 'lucide-react';

export default function Header({ user }: { user?: any }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      
      {/* Search Bar */}
      <div className="flex items-center w-96 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search candidates, jobs, or employees..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-700">{user?.name || "System User"}</div>
            <div className="text-xs text-slate-500">{user?.role || "ROLE_NOT_FOUND"}</div>
          </div>
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
            {user?.name?.[0] || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}
