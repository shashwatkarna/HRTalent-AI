"use server";

import { db } from "@/lib/prisma";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function clockIn() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { error: "Not authenticated" };

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user?.employeeProfile) return { error: "Employee profile not found" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already clocked in today
  const existing = await db.attendance.findFirst({
    where: {
      employeeProfileId: user.employeeProfile.id,
      date: today
    }
  });

  if (existing) {
    return { error: "Already clocked in today" };
  }

  await db.attendance.create({
    data: {
      employeeProfileId: user.employeeProfile.id,
      date: today,
      clockIn: new Date(),
      status: "PRESENT"
    }
  });

  revalidatePath("/employee/attendance");
  return { success: true };
}

export async function clockOut() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  if (!authUser) return { error: "Not authenticated" };

  const user = await db.user.findUnique({
    where: { email: authUser.email },
    include: { employeeProfile: true }
  });

  if (!user?.employeeProfile) return { error: "Employee profile not found" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.attendance.findFirst({
    where: {
      employeeProfileId: user.employeeProfile.id,
      date: today
    }
  });

  if (!existing || existing.clockOut) {
    return { error: "Cannot clock out" };
  }

  await db.attendance.update({
    where: { id: existing.id },
    data: { clockOut: new Date() }
  });

  revalidatePath("/employee/attendance");
  return { success: true };
}
