import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Missing Supabase env vars" }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    const keepEmail = "aman.admin@aitalent.com";

    // 1. Delete all non-user data
    await db.performanceReview.deleteMany({});
    await db.offer.deleteMany({});
    await db.aIEvaluation.deleteMany({});
    
    await db.payslip.deleteMany({});
    await db.attendance.deleteMany({});
    await db.leaveRequest.deleteMany({});
    await db.candidate.deleteMany({});
    await db.jobPosting.deleteMany({});
    await db.employeeProfile.deleteMany({
      where: {
        user: {
          email: { not: keepEmail }
        }
      }
    });
    await db.department.deleteMany({});

    // 2. Delete all users except keepEmail
    const deletedUsers = await db.user.deleteMany({
      where: {
        email: { not: keepEmail }
      }
    });

    // 3. Delete Supabase Auth users except keepEmail
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    
    let deletedAuthCount = 0;
    if (authUsers?.users) {
      for (const authUser of authUsers.users) {
        if (authUser.email !== keepEmail) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
          deletedAuthCount++;
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Database cleaned! Deleted ${deletedUsers.count} Prisma Users and ${deletedAuthCount} Supabase Users. Kept: ${keepEmail}` 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
