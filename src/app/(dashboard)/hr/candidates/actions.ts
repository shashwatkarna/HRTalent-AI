"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { CandidateStatus } from "@prisma/client";

export async function addCandidate(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const jobId = formData.get("jobId") as string;

  if (!name || !email) {
    return { error: "Name and email are required." };
  }

  try {
    // Check if job exists, if not, create a default one (for hackathon flow)
    let targetJobId = jobId;
    if (!targetJobId) {
      const existingJob = await db.jobPosting.findFirst();
      if (existingJob) {
        targetJobId = existingJob.id;
      } else {
        const newJob = await db.jobPosting.create({
          data: {
            title: "Software Engineer",
            description: "Default job posting created by system.",
            requiredSkills: ["JavaScript", "React", "Node.js"],
            isActive: true
          }
        });
        targetJobId = newJob.id;
      }
    }

    const candidate = await db.candidate.create({
      data: {
        name,
        email,
        jobPostingId: targetJobId,
        status: "APPLIED",
        // Also create a blank AI Evaluation record immediately
        aiEvaluation: {
          create: {
            matchScore: Math.floor(Math.random() * 20) + 60, // Simulate a baseline resume score for now
            finalRecommendation: "Pending Interview"
          }
        }
      }
    });

    revalidatePath("/hr/candidates");
    return { success: true, candidateId: candidate.id };
  } catch (error: any) {
    return { error: "Failed to add candidate: " + error.message };
  }
}

export async function updateCandidateStatus(candidateId: string, status: CandidateStatus) {
  try {
    await db.candidate.update({
      where: { id: candidateId },
      data: { status }
    });
    
    revalidatePath("/hr/candidates");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update status." };
  }
}
