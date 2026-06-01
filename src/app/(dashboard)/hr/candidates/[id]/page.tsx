import { ArrowLeft, Brain, FileText, CheckCircle, XCircle, Mic } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function CandidateEvaluationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;
  
  // Mock Data representing the AI Evaluation result
  const evaluation = {
    id: id,
    name: "David Chen",
    role: "Senior AI Engineer",
    status: "AI_SCREENED",
    aiRecommendation: "Strongly Recommended",
    matchScore: 94,
    skillScore: 95,
    expScore: 92,
    extractedSkills: ["Python", "PyTorch", "TensorFlow", "React", "Next.js", "Docker", "AWS"],
    missingSkills: ["GraphQL"],
    aiSummary: "David is an exceptionally strong candidate for the Senior AI Engineer position. His resume indicates extensive experience in building and deploying Large Language Models (LLMs) to production, which perfectly matches the primary requirement of this role. He possesses 5+ years of Python and PyTorch experience. His fullstack capabilities (React/Next.js) are a significant bonus.",
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back Navigation */}
      <Link href="/hr/candidates" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Pipeline
      </Link>

      {/* Header Card */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-2xl font-bold">
              {evaluation.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{evaluation.name}</h1>
              <p className="text-lg text-slate-500 font-medium">{evaluation.role}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            <Badge className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1">
              {evaluation.aiRecommendation}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                <FileText className="w-4 h-4 mr-2" /> View Original Resume
              </Button>
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <Mic className="w-4 h-4 mr-2" /> Start AI Interview
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Scores */}
        <div className="space-y-6 md:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
              <Brain className="w-5 h-5 text-indigo-600 mr-2" /> 
              AI Match Scores
            </h3>
            
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-600">Overall Match</span>
                  <span className="text-2xl font-bold text-indigo-600">{evaluation.matchScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${evaluation.matchScore}%` }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-600">Skills Match</span>
                  <span className="text-xl font-bold text-emerald-600">{evaluation.skillScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${evaluation.skillScore}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-medium text-slate-600">Experience Match</span>
                  <span className="text-xl font-bold text-blue-600">{evaluation.expScore}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${evaluation.expScore}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="space-y-6 md:col-span-2">
          
          {/* AI Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">AI Candidate Summary</h3>
            <p className="text-slate-600 leading-relaxed">
              {evaluation.aiSummary}
            </p>
          </div>

          {/* Extracted Skills */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Skill Analysis</h3>
            
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" /> Matched Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {evaluation.extractedSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center">
                <XCircle className="w-4 h-4 text-red-400 mr-2" /> Missing Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {evaluation.missingSkills.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium border border-red-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
