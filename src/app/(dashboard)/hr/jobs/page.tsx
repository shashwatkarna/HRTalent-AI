import { db } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Briefcase, Users, FileText, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ToggleJobButton } from "./ToggleJobButton";

export default async function HRJobsPage() {
  const jobs = await db.jobPosting.findMany({
    include: {
      _count: {
        select: { candidates: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Postings</h1>
          <p className="text-slate-500 mt-1">Manage active listings and review role requirements.</p>
        </div>
        
        <Link href="/hr/jobs/create">
          <Button className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Create Job Posting
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                <th className="p-4 font-semibold w-1/3">Job Title</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-center">Applicants</th>
                <th className="p-4 font-semibold">Posted Date</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Briefcase className="w-8 h-8 text-slate-300 mb-2" />
                      <p>No job postings found.</p>
                    </div>
                  </td>
                </tr>
              ) : jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 align-top">
                    <p className="font-bold text-slate-800">{job.title}</p>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{job.description}</p>
                  </td>
                  <td className="p-4 text-center align-top">
                    <Badge variant={job.isActive ? "default" : "secondary"}>
                      {job.isActive ? "Active" : "Closed"}
                    </Badge>
                  </td>
                  <td className="p-4 text-center align-top">
                    <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-sm font-semibold text-slate-700">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {job._count.candidates}
                    </div>
                  </td>
                  <td className="p-4 align-top text-sm text-slate-600">
                    {format(new Date(job.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="p-4 align-top text-right flex justify-end gap-2">
                    <ToggleJobButton jobId={job.id} isActive={job.isActive} />
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                      Edit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
