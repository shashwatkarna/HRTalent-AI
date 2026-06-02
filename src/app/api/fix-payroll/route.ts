import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await db.user.findMany();
    let totalPayroll = 0;
    
    for (const user of users) {
      let salary = 80000;
      if (user.role === "ADMIN" || user.role === "SENIOR_MANAGER") salary = 140000;
      if (user.role === "HR_RECRUITER") salary = 95000;
      if (user.role === "EMPLOYEE") salary = 65000;
      
      salary += Math.floor(Math.random() * 10000);
      totalPayroll += salary;

      await db.employeeProfile.upsert({
        where: { userId: user.id },
        update: {
          salary: salary,
          employmentStatus: "ACTIVE"
        },
        create: {
          userId: user.id,
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          salary: salary,
          employmentStatus: "ACTIVE",
          joiningDate: new Date()
        }
      });
    }
    
    let terminatedProfile;
    const pastUser = await db.user.findFirst({ where: { email: "terminated@aitalent.com" } });
    if (!pastUser) {
      const dummy = await db.user.create({
        data: {
          email: "terminated@aitalent.com",
          name: "Terminated Employee",
          role: "EMPLOYEE"
        }
      });
      terminatedProfile = await db.employeeProfile.create({
        data: {
          userId: dummy.id,
          employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
          salary: 60000,
          employmentStatus: "TERMINATED",
          joiningDate: new Date(Date.now() - 31536000000)
        }
      });
    }

    return NextResponse.json({ success: true, message: `Payroll fixed. Total payroll seeded: $${totalPayroll}` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
