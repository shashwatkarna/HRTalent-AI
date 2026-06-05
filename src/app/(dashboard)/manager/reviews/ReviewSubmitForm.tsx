"use client";

import { useState } from "react";
import { submitReview } from "./actions";
import { Star } from "lucide-react";

interface Props {
  employeeProfileId: string;
  managerId: string;
  reviewCycleId: string;
  employeeName: string;
}

export default function ReviewSubmitForm({ employeeProfileId, managerId, reviewCycleId, employeeName }: Props) {
  const [metrics, setMetrics] = useState({
    workQuality: 0,
    communication: 0,
    punctuality: 0
  });
  
  const [hoveredMetrics, setHoveredMetrics] = useState({
    workQuality: 0,
    communication: 0,
    punctuality: 0
  });

  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateAverage = () => {
    const total = metrics.workQuality + metrics.communication + metrics.punctuality;
    if (metrics.workQuality === 0 || metrics.communication === 0 || metrics.punctuality === 0) return 0;
    return Math.round(total / 3);
  };

  const handleRatingChange = (category: keyof typeof metrics, value: number) => {
    setMetrics(prev => ({ ...prev, [category]: value }));
  };

  const handleHoverChange = (category: keyof typeof hoveredMetrics, value: number) => {
    setHoveredMetrics(prev => ({ ...prev, [category]: value }));
  };

  const handleSubmit = async () => {
    const averageRating = calculateAverage();
    if (averageRating === 0) return alert("Please select a rating for all categories.");
    if (!comments.trim()) return alert("Please provide some comments.");

    setIsSubmitting(true);
    const res = await submitReview(employeeProfileId, managerId, reviewCycleId, averageRating, comments, metrics);
    if (!res.success) {
      alert("Failed to submit review: " + res.error);
    }
    setIsSubmitting(false);
  };

  const renderStarRatingRow = (label: string, category: keyof typeof metrics) => (
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm font-medium text-slate-700 w-48">{label}</span>
      <div className="flex gap-1 flex-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => handleHoverChange(category, star)}
            onMouseLeave={() => handleHoverChange(category, 0)}
            onClick={() => handleRatingChange(category, star)}
          >
            <Star 
              className={`w-5 h-5 ${
                star <= (hoveredMetrics[category] || metrics[category]) 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-slate-300"
              } transition-colors`} 
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <h4 className="text-sm font-semibold text-slate-900 mb-4">Submit Review for {employeeName}</h4>
      
      <div className="mb-6 space-y-1">
        {renderStarRatingRow("Work Quality & Output", "workQuality")}
        {renderStarRatingRow("Communication & Teamwork", "communication")}
        {renderStarRatingRow("Punctuality & Reliability", "punctuality")}
      </div>

      <textarea
        placeholder={`Write your performance evaluation for ${employeeName}...`}
        className="w-full text-sm rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] mb-3 text-slate-900"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || calculateAverage() === 0 || !comments.trim()}
        className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
      >
        {isSubmitting ? "Submitting..." : "Submit Official Review"}
      </button>
    </div>
  );
}
