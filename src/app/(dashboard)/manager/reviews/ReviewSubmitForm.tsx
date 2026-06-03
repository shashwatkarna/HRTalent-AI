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
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return alert("Please select a rating.");
    if (!comments.trim()) return alert("Please provide some comments.");

    setIsSubmitting(true);
    const res = await submitReview(employeeProfileId, managerId, reviewCycleId, rating, comments);
    if (!res.success) {
      alert("Failed to submit review: " + res.error);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100">
      <h4 className="text-sm font-semibold text-slate-900 mb-2">Submit Review for {employeeName}</h4>
      
      <div className="flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
          >
            <Star 
              className={`w-6 h-6 ${
                star <= (hoveredRating || rating) 
                  ? "fill-amber-400 text-amber-400" 
                  : "text-slate-300"
              } transition-colors`} 
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-slate-500 flex items-center">
          {rating > 0 ? `${rating} out of 5` : "Select a rating"}
        </span>
      </div>

      <textarea
        placeholder={`Write your performance evaluation for ${employeeName}...`}
        className="w-full text-sm rounded-lg border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 min-h-[100px] mb-3 text-slate-900"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0 || !comments.trim()}
        className="w-full bg-indigo-600 text-white rounded-lg px-4 py-2 font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-indigo-200"
      >
        {isSubmitting ? "Submitting..." : "Submit Official Review"}
      </button>
    </div>
  );
}
