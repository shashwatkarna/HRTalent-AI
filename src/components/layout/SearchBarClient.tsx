"use client";

import { useState, useEffect, useRef } from "react";
import { Search, User, Briefcase, Building2, ChevronRight, Loader2 } from "lucide-react";
import { globalSearch, SearchResult } from "@/app/actions/search";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SearchBarClient({ userRole }: { userRole?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when navigating
  useEffect(() => {
    setIsOpen(false);
    setQuery("");
  }, [pathname]);

  // Debounced search
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const data = await globalSearch(query, userRole || "EMPLOYEE");
        setResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(() => {
      fetchResults();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query, userRole]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'employee': return <User className="w-4 h-4 text-indigo-500" />;
      case 'candidate': return <User className="w-4 h-4 text-blue-500" />;
      case 'job': return <Briefcase className="w-4 h-4 text-emerald-500" />;
      case 'department': return <Building2 className="w-4 h-4 text-purple-500" />;
      default: return <Search className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="hidden md:block relative w-96 z-50" ref={searchRef}>
      <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
        {isSearching ? (
          <Loader2 className="w-4 h-4 text-blue-500 mr-2 shrink-0 animate-spin" />
        ) : (
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
        )}
        <input 
          type="text" 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
          placeholder="Search candidates, jobs, or employees..." 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400"
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && query.trim().length >= 2 && (
        <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
          {results.length === 0 && !isSearching ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto py-2">
              {/* Group results by type if desired, or just list them */}
              {results.map((result) => (
                <Link 
                  href={result.href} 
                  key={result.id}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getIcon(result.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {result.title}
                    </div>
                    <div className="text-xs text-slate-500 truncate capitalize">
                      {result.subtitle} • {result.type}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                </Link>
              ))}
            </div>
          )}
          
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 flex justify-between items-center">
            <span>Powered by Omni-Search</span>
            <span className="font-medium text-slate-500">Esc to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
