"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { sendTerminationEmail, sendTerminationRejectionEmail } from "@/app/actions/email";

export async function approveTerminationRequest(requestId: string, targetUserId: string, targetUserEmail: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) return { error: "Unauthorized access" };
    const currentUser = await db.user.findUnique({ where: { email: authUser.email } });
    if (!currentUser || currentUser.role !== "HR_RECRUITER") {
      return { error: "Unauthorized access. Only HR can approve terminations." };
    }

    // Get target user details before deletion
    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });

    // 1. Delete any pending requests referencing this user first (to avoid foreign key constraint error)
    await db.hRActionRequest.deleteMany({ where: { targetEmployeeId: targetUserId } });

    // 2. Delete from DB (This cascades to EmployeeProfile, etc.)
    await db.user.delete({ where: { id: targetUserId } });

    // 3. Delete from Supabase Auth
    try {
      const supabaseAdmin = createAdminClient();
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const sUser = users.find(u => u.email === targetUserEmail);
      if (sUser) {
        await supabaseAdmin.auth.admin.deleteUser(sUser.id);
      }
    } catch (e) {
      console.error("Failed to delete from Supabase", e);
    }

    // 4. Send Email Notification
    if (targetUser) {
      await sendTerminationEmail(targetUserEmail, targetUser.name || "Employee");
    }

    revalidatePath("/hr/requests");
    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to execute termination: " + error.message };
  }
}

export async function rejectTerminationRequest(requestId: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) return { error: "Unauthorized access" };
    const currentUser = await db.user.findUnique({ where: { email: authUser.email } });
    if (!currentUser || currentUser.role !== "HR_RECRUITER") {
      return { error: "Unauthorized access. Only HR can reject terminations." };
    }

    const requestDetails = await db.hRActionRequest.findUnique({
      where: { id: requestId },
      include: { requester: true, targetEmployee: true }
    });

    await db.hRActionRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED" }
    });

    if (requestDetails?.requester?.email && requestDetails?.targetEmployee?.name) {
      await sendTerminationRejectionEmail(
        requestDetails.requester.email,
        requestDetails.targetEmployee.name
      );
    }

    revalidatePath("/hr/requests");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to reject termination request: " + error.message };
  }
}
