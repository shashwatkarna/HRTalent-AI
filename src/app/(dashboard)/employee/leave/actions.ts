"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequest(employeeId: string, formData: FormData) {
  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const reason = formData.get("reason") as string;

  if (!type || !startDateStr || !endDateStr) {
    return { success: false, error: "Missing required fields." };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (endDate < startDate) {
    return { success: false, error: "End date cannot be before start date." };
  }

  try {
    await db.leaveRequest.create({
      data: {
        employeeProfileId: employeeId,
        type,
        startDate,
        endDate,
        reason,
        status: "PENDING"
      }
    });

    revalidatePath("/employee/leave");
    return { success: true };
  } catch (error: any) {
    console.error("Leave request error:", error);
    return { success: false, error: "Failed to submit leave request." };
  }
}
