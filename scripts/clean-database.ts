import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const keepEmail = "aman.admin@aitalent.com";

  console.log("Starting database cleanup...");
  console.log(`Keeping ONLY: ${keepEmail}`);

  try {
    // 1. Delete all non-user data
    console.log("Deleting PayrollRecords...");
    await prisma.payrollRecord.deleteMany({});
    
    console.log("Deleting AttendanceRecords...");
    await prisma.attendanceRecord.deleteMany({});
    
    console.log("Deleting LeaveRequests...");
    await prisma.leaveRequest.deleteMany({});
    
    console.log("Deleting Candidates...");
    await prisma.candidate.deleteMany({});
    
    console.log("Deleting JobPostings...");
    await prisma.jobPosting.deleteMany({});
    
    console.log("Deleting Departments...");
    await prisma.department.deleteMany({});
    
    // We should be careful not to delete Aman's EmployeeProfile if it exists,
    // but the request is to wipe all data. We will delete all EmployeeProfiles not linked to Aman.
    console.log("Deleting Employee Profiles (except Aman)...");
    await prisma.employeeProfile.deleteMany({
      where: {
        user: {
          email: { not: keepEmail }
        }
      }
    });

    // 2. Delete all Prisma Users except Aman
    console.log("Deleting Prisma Users (except Aman)...");
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: { not: keepEmail }
      }
    });
    console.log(`Deleted ${deletedUsers.count} Prisma Users.`);

    // 3. Delete Supabase Auth Users
    console.log("Cleaning Supabase Auth Users...");
    const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();
    if (error) throw error;

    let deletedAuthCount = 0;
    for (const authUser of authUsers.users) {
      if (authUser.email !== keepEmail) {
        await supabaseAdmin.auth.admin.deleteUser(authUser.id);
        deletedAuthCount++;
      }
    }
    console.log(`Deleted ${deletedAuthCount} Supabase Auth Users.`);

    console.log("Cleanup complete!");
  } catch (error) {
    console.error("Cleanup failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
