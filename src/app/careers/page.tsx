import { db } from "@/lib/prisma";
import Link from "next/link";
import { Briefcase, MapPin, Clock, ArrowRight } from "lucide-react";

export default async function CareersPage() {
  const jobs = await db.jobPosting.findMany({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Hero Section */}
      <div className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 font-outfit">Join Our Mission</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            We are building the future of work. Discover your next career opportunity and experience our AI-driven hiring process.
          </p>
        </div>
      </div>

      {/* Jobs List */}
      <div className="max-w-4xl mx-auto py-16 px-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-slate-900">Open Positions</h2>
          <p className="text-slate-500 mt-2">Find a role that fits your skills.</p>
        </div>

        <div className="space-y-4">
          {jobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
              <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No open positions</h3>
              <p className="text-slate-500">Check back later for new opportunities.</p>
            </div>
          ) : (
            jobs.map((job) => (
              <Link 
                key={job.id} 
                href={`/careers/${job.id}`}
                className="block bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all group"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                    <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" /> Remote / Global
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Full-time
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform">
                    View Details <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
