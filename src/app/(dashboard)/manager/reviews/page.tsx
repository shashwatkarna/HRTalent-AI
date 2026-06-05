import { db } from "@/lib/prisma";
import { Star, FileText, CheckCircle2 } from "lucide-react";
import ReviewSubmitForm from "./ReviewSubmitForm";
import { format } from "date-fns";

import { createClient } from "@/utils/supabase/server";

export default async function ManagerReviewsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user?.email) {
    return <div>Not authenticated</div>;
  }

  const managerProfile = await db.employeeProfile.findFirst({
    where: { user: { email: user.email } },
    include: {
      directReports: {
        include: { user: true }
      }
    }
  });

  if (!managerProfile) return <div>Manager profile not found</div>;

  // Fetch the currently OPEN review cycle
  const activeCycle = await db.reviewCycle.findFirst({
    where: { status: "OPEN" },
    orderBy: { createdAt: 'desc' }
  });

  // Fetch reviews submitted by this manager for this cycle
  const submittedReviews = activeCycle ? await db.performanceReview.findMany({
    where: {
      managerId: managerProfile.id,
      reviewCycleId: activeCycle.id
    }
  }) : [];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Performance Reviews</h1>
          <p className="text-slate-500 mt-2">Manage and submit official performance reviews for your team.</p>
        </div>
        
        {activeCycle ? (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex flex-col items-end shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Active Cycle</span>
            <span className="font-semibold">{activeCycle.name}</span>
            <span className="text-xs opacity-75 mt-0.5">Closes {format(activeCycle.endDate, 'MMM dd, yyyy')}</span>
          </div>
        ) : (
          <div className="bg-slate-100 border border-slate-200 text-slate-600 px-4 py-3 rounded-xl shadow-sm">
            <span className="text-sm font-semibold">No active review cycles</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {managerProfile.directReports.map((emp) => {
          const existingReview: any = submittedReviews.find((r: any) => r.employeeProfileId === emp.id);

          return (
            <div key={emp.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-lg">{emp.user.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{emp.user.name}</h3>
                      <p className="text-sm text-slate-500">{emp.designation || 'Employee'}</p>
                    </div>
                  </div>
                  
                  {existingReview ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> Submitted
                    </span>
                  ) : (
                    <span className="inline-flex items-center bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                      Action Required
                    </span>
                  )}
                </div>

                {existingReview ? (
                  <div className="space-y-4">
                    <div className="flex flex-col gap-3">
                      {existingReview.metrics ? (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Work Quality</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={`wq-${star}`} className={`w-3 h-3 ${star <= (existingReview.metrics as any).workQuality ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Communication</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={`cm-${star}`} className={`w-3 h-3 ${star <= (existingReview.metrics as any).communication ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium">Punctuality</span>
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star key={`pt-${star}`} className={`w-3 h-3 ${star <= (existingReview.metrics as any).punctuality ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                              ))}
                            </div>
                          </div>
                          <div className="w-full h-px bg-slate-100 my-1"></div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-slate-900">Overall Average</span>
                            <span className="font-bold text-indigo-600">{existingReview.rating}/5</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-5 h-5 ${star <= (existingReview.rating || 0) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                            />
                          ))}
                          <span className="ml-2 font-bold text-slate-700">{existingReview.rating}/5</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-500" />
                        <h4 className="text-sm font-semibold text-slate-700">Manager Comments</h4>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {existingReview.managerComments}
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-slate-500 mb-2">
                      Please evaluate {emp.user.name}'s performance for this cycle. Ratings and comments will be visible to HR.
                    </p>
                    {activeCycle && (
                      <ReviewSubmitForm 
                        employeeProfileId={emp.id}
                        managerId={managerProfile.id}
                        reviewCycleId={activeCycle.id}
                        employeeName={emp.user.name || "Employee"}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}

        {managerProfile.directReports.length === 0 && (
          <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-500">No direct reports found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
