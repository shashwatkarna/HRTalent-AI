"use server";

import { createClient } from "@supabase/supabase-js";
import { db } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function provisionEmployee(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!name || !email || !password || !role) {
    return { error: "All fields are required." };
  }

  // 1. Initialize Supabase Admin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return { error: "Server Configuration Error: Missing Supabase keys." };
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  // 2. Create User in Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (authError) {
    // If user already exists, we might want to just update them or show an error
    return { error: authError.message };
  }

  // 3. Create User in Prisma
  try {
    await db.user.create({
      data: {
        email,
        name,
        role: role as any, // "ADMIN" | "SENIOR_MANAGER" | "HR_RECRUITER" | "EMPLOYEE"
      }
    });
  } catch (dbError) {
    // Cleanup if Prisma fails (rollback)
    if (authData?.user?.id) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    }
    return { error: "Failed to create Database record. Rolled back." };
  }

  redirect("/admin/employees");
}
