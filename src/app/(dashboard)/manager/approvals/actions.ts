"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateLeaveStatus(leaveId: string, status: "APPROVED" | "REJECTED") {
  try {
    await db.leaveRequest.update({
      where: { id: leaveId },
      data: { status }
    });
    
    // Revalidate the page so the UI updates instantly
    revalidatePath("/manager/approvals");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating leave status:", error);
    return { success: false, error: error.message };
  }
}
