"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function clockInAction(employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if there is already an attendance record for today
  const existing = await db.attendance.findFirst({
    where: {
      employeeProfileId: employeeId,
      date: today
    }
  });

  if (existing) {
    if (!existing.clockIn) {
      await db.attendance.update({
        where: { id: existing.id },
        data: { clockIn: new Date(), status: "PRESENT" }
      });
    }
  } else {
    await db.attendance.create({
      data: {
        employeeProfileId: employeeId,
        date: today,
        clockIn: new Date(),
        status: "PRESENT"
      }
    });
  }

  revalidatePath("/", "layout");
}

export async function clockOutAction(employeeId: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await db.attendance.findFirst({
    where: {
      employeeProfileId: employeeId,
      date: today
    }
  });

  if (existing && !existing.clockOut) {
    await db.attendance.update({
      where: { id: existing.id },
      data: { clockOut: new Date() }
    });
  }

  revalidatePath("/", "layout");
}
