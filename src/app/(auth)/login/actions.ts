"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { db } from "@/lib/prisma";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  // 1. Authenticate with Supabase
  const { error, data: authData } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  // 2. Fetch the user from our Prisma Database to get their exact Role
  const user = await db.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Fallback if user exists in Supabase but not in Prisma yet
    return { error: "Account not fully provisioned. Please contact Admin." };
  }

  // 3. Strict Role-Based Routing
  if (user.role === "ADMIN" || user.role === "MANAGEMENT") {
    redirect("/admin");
  } else if (user.role === "HR_RECRUITER") {
    redirect("/hr");
  } else if (user.role === "SENIOR_MANAGER") {
    redirect("/manager");
  } else {
    redirect("/employee");
  }
}
