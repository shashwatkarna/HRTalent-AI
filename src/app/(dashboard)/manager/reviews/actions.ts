"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitReview(
  employeeProfileId: string, 
  managerId: string,
  reviewCycleId: string, 
  rating: number, 
  managerComments: string,
  metrics: any
) {
  try {
    // Upsert the review in case they are editing a draft, though for this hackathon we just create/submit
    await db.performanceReview.upsert({
      where: {
        employeeProfileId_reviewCycleId: {
          employeeProfileId,
          reviewCycleId
        }
      },
      update: {
        rating,
        managerComments,
        metrics,
        status: "SUBMITTED"
      },
      create: {
        employeeProfileId,
        managerId,
        reviewCycleId,
        rating,
        managerComments,
        metrics,
        status: "SUBMITTED"
      }
    });

    revalidatePath("/manager/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("Error submitting review:", error);
    return { success: false, error: error.message };
  }
}
