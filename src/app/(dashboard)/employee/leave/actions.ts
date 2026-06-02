"use server";

import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitLeaveRequest(formData: FormData) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { error: "Not authenticated" };

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user?.employeeProfile) return { error: "Employee profile not found" };

  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const reason = formData.get("reason") as string;

  if (!type || !startDateStr || !endDateStr) {
    return { error: "Missing required fields" };
  }

  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);

  if (startDate > endDate) {
    return { error: "End date must be after start date" };
  }

  await db.leaveRequest.create({
    data: {
      employeeProfileId: user.employeeProfile.id,
      type,
      startDate,
      endDate,
      reason,
      status: "PENDING"
    }
  });

  revalidatePath("/employee/leave");
  revalidatePath("/employee"); // Update overview stats potentially
  return { success: true };
}
