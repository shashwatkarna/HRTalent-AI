import { db } from "@/lib/prisma";
import { Briefcase, CheckCircle2, XCircle, Clock, Search, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ClientSearch } from "@/components/ui/ClientSearch";
import { GenerateOfferModal } from "./GenerateOfferModal";

export default async function OffersApprovalsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.q || "";

  // Fetch candidates who have been SELECTED, HIRED, or REJECTED
  const candidates = await db.candidate.findMany({
    where: {
      status: {
        in: ["SELECTED", "HIRED", "REJECTED"]
      },
      ...(query ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { jobPosting: { title: { contains: query, mode: "insensitive" } } }
        ]
      } : {})
    },
    include: { 
      jobPosting: true,
      offer: true
    },
    orderBy: { updatedAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-indigo-600" />
            Offers & Approvals
          </h1>
          <p className="text-slate-500 mt-1">Generate offer letters for selected candidates and track acceptances.</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <ClientSearch placeholder="Search candidates or roles..." />
          <div className="text-sm text-slate-500 font-medium">
            Pending Offers: {candidates.filter(c => c.offer?.status === 'PENDING').length}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Candidate</th>
                <th className="px-6 py-4">Applied Role</th>
                <th className="px-6 py-4">Offer Status</th>
                <th className="px-6 py-4">Salary Details</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {candidates.map((candidate) => {
                const hasOffer = !!candidate.offer;
                
                return (
                  <tr key={candidate.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold">
                          {candidate.name[0].toUpperCase()}
                        </div>
                        <div>
                          <Link href={`/hr/candidates/${candidate.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 transition-colors">
                            {candidate.name}
                          </Link>
                          <div className="text-slate-500 text-xs mt-0.5">
                            {candidate.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {hasOffer ? candidate.offer?.designation : candidate.jobPosting?.title || "Unknown Role"}
                    </td>

                    <td className="px-6 py-4">
                      {!hasOffer ? (
                        <Badge variant="outline" className="bg-slate-100 text-slate-500 border-slate-200">Needs Offer</Badge>
                      ) : candidate.offer?.status === "ACCEPTED" ? (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" /> Accepted
                        </Badge>
                      ) : candidate.offer?.status === "REJECTED" ? (
                        <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-200 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" /> Rejected
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3" /> Pending
                        </Badge>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {hasOffer ? (
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">${candidate.offer?.salary.toLocaleString()} / yr</span>
                          <span className="text-xs text-slate-500">Starts: {candidate.offer?.joiningDate.toLocaleDateString()}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Not set</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right">
                      {!hasOffer ? (
                        <GenerateOfferModal 
                          candidateId={candidate.id} 
                          candidateName={candidate.name} 
                          roleTitle={candidate.jobPosting?.title || ""}
                        />
                      ) : (
                        <Link href={`/offer/${candidate.offer?.id}`} target="_blank">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-md text-xs font-medium transition-colors ml-auto shadow-sm">
                            <FileText className="w-3.5 h-3.5" />
                            View Offer Link
                          </button>
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
              
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Briefcase className="w-12 h-12 mb-3 text-slate-300" />
                      <p className="font-medium text-slate-900">No selected candidates yet.</p>
                      <p className="text-sm mt-1">Once candidates pass the interview and are marked "SELECTED", they will appear here.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
