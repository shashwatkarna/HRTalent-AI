"use server";

import { db } from "@/lib/prisma";
import { sendOnboardingCredentials } from "@/app/actions/email";
import { revalidatePath } from "next/cache";

export async function extendOfferAction(candidateId: string, email: string) {
  try {
    // Update the candidate status to HIRED
    await db.candidate.update({
      where: { id: candidateId },
      data: { status: "HIRED" }
    });

    // In a full implementation, we would create the User and EmployeeProfile here.
    // For this demonstration, we simulate the onboarding email dispatch.
    const tempPassword = "WelcomeToTheTeam2026!";
    const emailRes = await sendOnboardingCredentials(email, tempPassword);

    if (!emailRes.success) {
      return { success: false, error: emailRes.error };
    }

    revalidatePath("/manager/recruitment");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to extend offer:", error);
    return { success: false, error: error.message || "Failed to extend offer" };
  }
}
