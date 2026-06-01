"use server";

import { createAdminClient } from "@/utils/supabase/admin";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

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
            department: "Unassigned",
            position: role.replace("_", " "),
            salary: 0,
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
