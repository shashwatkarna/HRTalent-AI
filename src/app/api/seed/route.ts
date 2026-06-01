import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const accountsToSeed = [
    { email: 'aman.admin@aitalent.com', password: 'Password123!', role: 'ADMIN', name: 'Aman' },
    { email: 'aryan.manager@aitalent.com', password: 'Password123!', role: 'SENIOR_MANAGER', name: 'Aryan' },
    { email: 'shreya.hr@aitalent.com', password: 'Password123!', role: 'HR_RECRUITER', name: 'Shreya' },
    { email: 'shashwat.employee@aitalent.com', password: 'Password123!', role: 'EMPLOYEE', name: 'Shashwat' },
  ];

  let logs = [];

  for (const account of accountsToSeed) {
    // 1. Supabase Auth
    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let authUser = users.find(u => u.email === account.email);

    if (!authUser) {
      const { data: newAuthUser, error } = await supabaseAdmin.auth.admin.createUser({
        email: account.email,
        password: account.password,
        email_confirm: true,
        user_metadata: { name: account.name }
      });
      if (error) {
        logs.push(`Failed Supabase Auth for ${account.email}: ${error.message}`);
        continue;
      }
      authUser = newAuthUser.user;
      logs.push(`Created Supabase Auth for ${account.email}`);
    } else {
      logs.push(`Supabase Auth exists for ${account.email}`);
    }

    // 2. Prisma DB
    try {
      await db.user.upsert({
        where: { email: account.email },
        update: { role: account.role as any, name: account.name },
        create: { email: account.email, role: account.role as any, name: account.name }
      });
      logs.push(`Created Prisma record for ${account.email} with role ${account.role}`);
    } catch (e: any) {
      logs.push(`Failed Prisma record for ${account.email}: ${e.message}`);
    }
  }

  return NextResponse.json({ success: true, logs });
}
