"use server";

import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/prisma";

export async function setupAdmin(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password || password.length < 6) {
    return { error: "Valid email and password (min 6 chars) are required." };
  }

  // 1. Create the user in Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    // If user already exists in Supabase, we can just proceed to create them in Prisma
    if (authError.message.includes("already registered")) {
      // It's okay, we'll try to upsert them into Prisma below
    } else {
      return { error: authError.message };
    }
  }

  // 2. Create the user in Prisma with ADMIN role
  try {
    await db.user.upsert({
      where: { email },
      update: { role: "ADMIN" },
      create: {
        email,
        name: "Super Admin",
        role: "ADMIN",
      },
    });
    
    return { success: true };
  } catch (dbError: any) {
    return { error: "Failed to create Admin record in database: " + dbError.message };
  }
}
