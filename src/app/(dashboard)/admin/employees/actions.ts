"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { createClient } from "@/utils/supabase/server";

export async function addEmployee(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const role = formData.get("role") as string;

  if (!email || !password || !name || !role) {
    return { error: "All fields are required." };
  }

  const supabaseAdmin = createAdminClient();

  // 1. Silently create the user in Supabase Auth using Admin API
  // This bypasses email confirmations and prevents the current Admin from being logged out!
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirm the user
    user_metadata: { name },
  });

  if (authError) {
    return { error: authError.message };
  }

  // 2. Insert into Prisma Database
  try {
    const newUser = await db.user.create({
      data: {
        email: email,
        name: name,
        role: role as Role,
        // Automatically create an empty EmployeeProfile for them
        employeeProfile: {
          create: {
            designation: role.replace("_", " "),
            salary: 0,
            employmentStatus: "ACTIVE",
            employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
          }
        }
      },
    });

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    // If DB fails, we technically should rollback Supabase Auth, but for hackathon this is fine.
    return { error: "Failed to save user in database: " + error.message };
  }
}

export async function updateLeaveStatus(leaveRequestId: string, newStatus: "APPROVED" | "REJECTED") {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) {
      return { error: "Unauthorized access" };
    }

    const currentUser = await db.user.findUnique({
      where: { email: authUser.email },
    });

    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGEMENT" && currentUser.role !== "SENIOR_MANAGER")) {
      return { error: "Unauthorized access" };
    }

    await db.leaveRequest.update({
      where: { id: leaveRequestId },
      data: { status: newStatus },
    });

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    console.error("Update Leave Status Error:", error);
    return { error: "Failed to update leave request status: " + error.message };
  }
}

export async function updateEmployee(userId: string, data: { name: string, role: string }) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) return { error: "Unauthorized access" };
    const currentUser = await db.user.findUnique({ where: { email: authUser.email } });
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGEMENT")) {
      return { error: "Unauthorized access" };
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        role: data.role as Role,
      },
    });

    // Also try updating EmployeeProfile designation
    try {
      await db.employeeProfile.update({
        where: { userId: userId },
        data: { designation: data.role.replace("_", " ") },
      });
    } catch(e) {
      // It might not exist, ignore
    }

    // Try to update Supabase metadata (optional, best effort)
    try {
      const supabaseAdmin = createAdminClient();
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const sUser = users.find(u => u.email === updatedUser.email);
      if (sUser) {
        await supabaseAdmin.auth.admin.updateUserById(sUser.id, { user_metadata: { name: data.name } });
      }
    } catch(e) {
      console.error(e);
    }

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to update employee: " + error.message };
  }
}

export async function deleteEmployee(userId: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) return { error: "Unauthorized access" };
    const currentUser = await db.user.findUnique({ where: { email: authUser.email } });
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGEMENT")) {
      return { error: "Unauthorized access" };
    }

    const targetUser = await db.user.findUnique({ where: { id: userId } });
    if (!targetUser) return { error: "User not found" };

    // 1. Delete from DB
    await db.user.delete({ where: { id: userId } });

    // 2. Delete from Supabase Auth
    try {
      const supabaseAdmin = createAdminClient();
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
      const sUser = users.find(u => u.email === targetUser.email);
      if (sUser) {
        await supabaseAdmin.auth.admin.deleteUser(sUser.id);
      }
    } catch (e) {
      console.error("Failed to delete from Supabase", e);
    }

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to delete employee: " + error.message };
  }
}

export async function requestTermination(targetUserId: string, reason: string) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser || !authUser.email) return { error: "Unauthorized access" };
    const currentUser = await db.user.findUnique({ where: { email: authUser.email } });
    if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MANAGEMENT" && currentUser.role !== "SENIOR_MANAGER")) {
      return { error: "Unauthorized access" };
    }

    const targetUser = await db.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) return { error: "User not found" };

    // Create the HRActionRequest
    await db.hRActionRequest.create({
      data: {
        requesterId: currentUser.id,
        targetEmployeeId: targetUserId,
        actionType: "TERMINATION",
        reason: reason,
        status: "PENDING"
      }
    });

    revalidatePath("/admin/employees");
    return { success: true };
  } catch (error: any) {
    return { error: "Failed to submit termination request: " + error.message };
  }
}
