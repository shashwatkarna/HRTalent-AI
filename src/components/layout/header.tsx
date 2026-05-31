import { Bell, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
      
      {/* Global Search */}
      <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Search employees, jobs, or requests..." 
          className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
        />
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5 text-slate-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* User Avatar Placeholder */}
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
          A
        </div>

      </div>
    </header>
  );
}
