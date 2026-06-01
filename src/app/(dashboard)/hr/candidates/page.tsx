import { Search, Filter, ChevronRight, Brain, Zap, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

// Mock Data representing the AI-Ranked Candidate Pipeline
const candidatePipeline = [
  { id: "CAN-101", name: "David Chen", role: "Senior AI Engineer", matchScore: 94, skillScore: 95, expScore: 92, status: "AI_SCREENED", aiRecommendation: "Strongly Recommended" },
  { id: "CAN-103", name: "Michael Ross", role: "Senior AI Engineer", matchScore: 91, skillScore: 88, expScore: 95, status: "AI_SCREENED", aiRecommendation: "Recommended" },
  { id: "CAN-102", name: "Sarah Williams", role: "Senior AI Engineer", matchScore: 89, skillScore: 90, expScore: 85, status: "AI_INTERVIEWED", aiRecommendation: "Recommended" },
  { id: "CAN-104", name: "Emily Watson", role: "Senior AI Engineer", matchScore: 72, skillScore: 70, expScore: 75, status: "APPLIED", aiRecommendation: "Not Recommended" },
];

export default function CandidatePipelinePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">AI Candidate Pipeline</h1>
          <p className="text-slate-500 mt-1">Review candidates ranked automatically by the AI matching engine.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search candidates..." 
            className="pl-9 bg-slate-50 border-slate-200"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="w-4 h-4 mr-2"/> Job Role</Button>
          <Button variant="outline"><Brain className="w-4 h-4 mr-2"/> Min Match Score</Button>
        </div>
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 gap-4">
        {candidatePipeline.map((candidate) => (
          <Link href={`/hr/candidates/${candidate.id}`} key={candidate.id} className="block group">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
              
              {/* Highlight bar based on score */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                candidate.matchScore >= 90 ? "bg-emerald-500" : 
                candidate.matchScore >= 80 ? "bg-blue-500" : 
                "bg-slate-300"
              }`}></div>

              {/* Avatar & Info */}
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-lg">
                  {candidate.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-indigo-600 transition-colors">{candidate.name}</h3>
                  <p className="text-sm text-slate-500">{candidate.role}</p>
                </div>
              </div>

              {/* AI Scores */}
              <div className="flex gap-8 items-center flex-1 justify-center">
                <div className="text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Brain className="w-4 h-4 text-indigo-500" />
                    <span className="text-2xl font-bold text-slate-900">{candidate.matchScore}%</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Overall Match</p>
                </div>
                
                <div className="hidden sm:block w-px h-10 bg-slate-200"></div>
                
                <div className="text-center hidden sm:block">
                  <div className="flex items-center gap-1.5 justify-center">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-xl font-bold text-slate-700">{candidate.skillScore}%</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Skills</p>
                </div>
              </div>

              {/* Status & Recommendation */}
              <div className="flex flex-col items-end gap-3 flex-1">
                <Badge variant="outline" className={`
                  ${candidate.aiRecommendation === 'Strongly Recommended' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : ''}
                  ${candidate.aiRecommendation === 'Recommended' ? 'border-blue-200 bg-blue-50 text-blue-700' : ''}
                  ${candidate.aiRecommendation === 'Not Recommended' ? 'border-red-200 bg-red-50 text-red-700' : ''}
                `}>
                  {candidate.aiRecommendation}
                </Badge>
                <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
                  {candidate.status === "AI_SCREENED" ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
                  {candidate.status.replace("_", " ")}
                </div>
              </div>

              <div className="text-slate-400 group-hover:text-indigo-600 transition-colors hidden md:block">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
