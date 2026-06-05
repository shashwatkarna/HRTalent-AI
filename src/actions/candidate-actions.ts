"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function shortlistCandidate(candidateId: string) {
  try {
    await db.candidate.update({
      where: { id: candidateId },
      data: { status: "SELECTED" }
    });

    revalidatePath("/hr/candidates");
    revalidatePath(`/hr/candidates/${candidateId}`);
    revalidatePath("/manager/recruitment");
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to shortlist candidate:", error);
    return { error: "Failed to shortlist candidate" };
  }
}
