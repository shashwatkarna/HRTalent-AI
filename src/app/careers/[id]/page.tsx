import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import ApplyForm from "./ApplyForm";

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const job = await db.jobPosting.findUnique({
    where: { id }
  });

  if (!job) return notFound();

  // Convert Prisma JSON array to string array for rendering
  const requiredSkills = Array.isArray(job.requiredSkills) 
    ? (job.requiredSkills as string[]) 
    : [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/careers" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to all jobs
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 font-outfit">{job.title}</h1>
          <div className="mt-4 flex flex-wrap gap-2">
             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">Full-time</span>
             <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">Remote</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Job Details Column */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">About the Role</h2>
            <div className="text-slate-600 leading-relaxed space-y-4 whitespace-pre-wrap">
              {job.description}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-4">Required Skills</h2>
            <ul className="space-y-3">
              {requiredSkills.map((skill, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-600">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Apply Column */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm sticky top-10">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Apply for this position</h3>
            <p className="text-sm text-slate-500 mb-6">Our AI will review your resume and invite you to an interview if there is a match.</p>
            
            <ApplyForm jobId={job.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
