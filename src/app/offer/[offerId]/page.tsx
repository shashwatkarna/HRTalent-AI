import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Building2, CheckCircle2, FileSignature, MapPin, XCircle } from "lucide-react";
import { OfferDecisionButtons } from "./OfferDecisionButtons";

export default async function OfferLetterPage({ params }: { params: Promise<{ offerId: string }> }) {
  const resolvedParams = await params;
  const offer = await db.offer.findUnique({
    where: { id: resolvedParams.offerId },
    include: {
      candidate: true
    }
  });

  if (!offer) return notFound();

  const isPending = offer.status === "PENDING";

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Status Banner */}
        {!isPending && (
          <div className={`mb-6 p-4 rounded-xl flex items-center justify-center gap-2 font-medium ${
            offer.status === "ACCEPTED" 
              ? "bg-emerald-100 text-emerald-800 border border-emerald-200" 
              : "bg-rose-100 text-rose-800 border border-rose-200"
          }`}>
            {offer.status === "ACCEPTED" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            You have {offer.status.toLowerCase()} this offer.
          </div>
        )}

        {/* Offer Letter Paper */}
        <div className="bg-white shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-200 overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-slate-900 px-8 py-10 text-white flex justify-between items-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold font-heading mb-1 tracking-tight">AITalent<span className="text-slate-400 font-normal">HR</span></h1>
              <p className="text-slate-400 flex items-center gap-1.5 text-sm mt-2">
                <Building2 className="w-4 h-4" /> Silicon Valley, CA
              </p>
            </div>
            <div className="text-right relative z-10">
              <p className="text-slate-300 font-medium tracking-widest uppercase text-xs mb-1">Official Document</p>
              <h2 className="text-xl font-semibold">Offer of Employment</h2>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 md:p-12 text-slate-800 leading-relaxed space-y-6">
            <div className="text-right text-slate-500 text-sm mb-8">
              Date: {offer.createdAt.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>

            <p>Dear <strong className="text-slate-900">{offer.candidate.name}</strong>,</p>
            
            <p>
              We are absolutely thrilled to offer you the full-time position of <strong className="text-slate-900 font-semibold">{offer.designation}</strong> at AITalentHR. 
              Following your impressive performance in the AI Voice Interview, our team is confident that your skills and experience will be a tremendous addition to our company.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 my-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Base Salary</p>
                <p className="text-2xl font-bold text-slate-900">₹{offer.salary.toLocaleString()}<span className="text-base font-normal text-slate-500"> / year</span></p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</p>
                <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  {offer.joiningDate.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <p>
              As a full-time employee, you will be eligible for our comprehensive benefits package, which includes health insurance, dental and vision coverage, a 401(k) matching program, and unlimited paid time off.
            </p>

            <p>
              Please review this offer carefully. If you choose to accept, this digital document will serve as your official employment agreement. We look forward to welcoming you to the team!
            </p>

            <div className="pt-8 mt-8 border-t border-slate-100 flex justify-between items-end">
              <div>
                <FileSignature className="w-12 h-12 text-slate-200 mb-2" />
                <p className="font-bold text-slate-900 border-b border-slate-300 inline-block pb-1 pr-12">Recruiting Team</p>
                <p className="text-sm text-slate-500 mt-1">AITalentHR Management</p>
              </div>
            </div>
          </div>
          
          {/* Action Footer */}
          {isPending && (
            <div className="bg-slate-50 px-8 py-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500">This offer is pending your decision.</p>
              <OfferDecisionButtons offerId={offer.id} candidateId={offer.candidateId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
