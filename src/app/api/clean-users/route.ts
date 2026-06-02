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

    const allowedEmails = [
      "aman.admin@aitalent.com",
      "aryan.manager@aitalent.com",
      "shreya.hr@aitalent.com",
      "shashwat.employee@aitalent.com"
    ];

    // Find all users not in the allowed list
    const usersToDelete = await db.user.findMany({
      where: {
        email: { notIn: allowedEmails }
      }
    });

    let deletedCount = 0;

    for (const user of usersToDelete) {
      if (user.email) {
        // Find them in Supabase Auth to delete them there too
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = authUsers?.users.find(u => u.email === user.email);
        
        if (authUser) {
          await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        }
      }
      
      // Prisma will cascade delete EmployeeProfile, Account, Session due to schema setup
      // Just to be safe, delete EmployeeProfile first if schema doesn't have cascade on that specific relation
      // Actually schema says: user User @relation(fields: [userId], references: [id], onDelete: Cascade)
      // So db.user.delete is enough!
      await db.user.delete({
        where: { id: user.id }
      });
      
      deletedCount++;
    }

    return NextResponse.json({ success: true, message: `Removed ${deletedCount} extra accounts.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
