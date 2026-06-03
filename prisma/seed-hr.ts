import 'dotenv/config';
import { Role } from '@prisma/client';
import { db as prisma } from '../src/lib/prisma';

async function main() {
  console.log("Seeding HR Data...");

  // 1. Create Departments
  const departmentsData = [
    { name: "Engineering", description: "Software development and IT" },
    { name: "Human Resources", description: "Talent acquisition and management" },
    { name: "Sales", description: "Revenue generation" },
    { name: "Marketing", description: "Brand and growth" }
  ];

  const departments = [];
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { name: dept.name },
      update: {},
      create: dept
    });
    departments.push(d);
  }

  // 2. Create Users & Employee Profiles
  // We'll create 1 Admin, 1 HR, and 10 Employees
  const usersToCreate = [
    { email: "admin@aitalent.com", name: "Alice Admin", role: Role.ADMIN, dept: "Engineering", designation: "CTO", salary: 250000 },
    { email: "hr@aitalent.com", name: "Hannah HR", role: Role.HR_RECRUITER, dept: "Human Resources", designation: "Head of HR", salary: 150000 },
    { email: "manager@aitalent.com", name: "Mike Manager", role: Role.SENIOR_MANAGER, dept: "Engineering", designation: "Engineering Manager", salary: 180000 },
    { email: "emp1@aitalent.com", name: "Bob Developer", role: Role.EMPLOYEE, dept: "Engineering", designation: "Senior Engineer", salary: 140000 },
    { email: "emp2@aitalent.com", name: "Charlie Coder", role: Role.EMPLOYEE, dept: "Engineering", designation: "Software Engineer", salary: 110000 },
    { email: "emp3@aitalent.com", name: "Diana Designer", role: Role.EMPLOYEE, dept: "Engineering", designation: "UI/UX Designer", salary: 120000 },
    { email: "emp4@aitalent.com", name: "Eve Sales", role: Role.EMPLOYEE, dept: "Sales", designation: "Account Executive", salary: 90000 },
    { email: "emp5@aitalent.com", name: "Frank Closer", role: Role.EMPLOYEE, dept: "Sales", designation: "Sales Lead", salary: 130000 },
  ];

  const profiles = [];

  for (let i = 0; i < usersToCreate.length; i++) {
    const uData = usersToCreate[i];
    const deptId = departments.find(d => d.name === uData.dept)?.id;

    // Create or find user
    const user = await prisma.user.upsert({
      where: { email: uData.email },
      update: {},
      create: {
        email: uData.email,
        name: uData.name,
        role: uData.role,
        // Using a hardcoded password hash or null (for OAuth/simplicity)
      }
    });

    // Create profile
    const profile = await prisma.employeeProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        employeeId: `EMP-00${i + 1}`,
        contactNumber: `+1555000${i}123`,
        designation: uData.designation,
        salary: uData.salary,
        departmentId: deptId,
        joiningDate: new Date(2025, 0, Math.floor(Math.random() * 28) + 1),
        employmentStatus: "ACTIVE"
      }
    });
    profiles.push(profile);
  }

  console.log("Users and Profiles created.");

  // 3. Create Attendance Records for May 2026 (last month relative to June 2026)
  // Let's generate 20 days of attendance for each employee
  console.log("Generating Attendance...");
  for (const profile of profiles) {
    for (let day = 1; day <= 20; day++) {
      const date = new Date(2026, 4, day); // May = month index 4
      
      // Introduce some random absences or late arrivals
      const isAbsent = Math.random() > 0.9;
      const clockInHour = isAbsent ? null : 8 + Math.random(); // between 8 and 9 AM
      
      let clockIn = null;
      let clockOut = null;
      
      if (!isAbsent) {
        clockIn = new Date(2026, 4, day, Math.floor(clockInHour!), Math.floor(Math.random() * 60));
        clockOut = new Date(2026, 4, day, 17, Math.floor(Math.random() * 60)); // 5 PM
      }

      await prisma.attendance.create({
        data: {
          employeeProfileId: profile.id,
          date: date,
          clockIn: clockIn,
          clockOut: clockOut,
          status: isAbsent ? "ABSENT" : "PRESENT"
        }
      });
    }
  }

  // 4. Create Leaves
  console.log("Generating Leaves...");
  for (const profile of profiles) {
    if (Math.random() > 0.5) {
      await prisma.leaveRequest.create({
        data: {
          employeeProfileId: profile.id,
          type: Math.random() > 0.5 ? "SICK" : "VACATION",
          startDate: new Date(2026, 4, Math.floor(Math.random() * 28) + 1),
          endDate: new Date(2026, 4, Math.floor(Math.random() * 28) + 1),
          reason: "Need some time off",
          status: Math.random() > 0.5 ? "APPROVED" : "PENDING"
        }
      });
    }
  }

  // 5. Create Payslips for May 2026
  console.log("Generating Payslips...");
  for (const profile of profiles) {
    if (!profile.salary) continue;

    const monthlyBasic = profile.salary / 12;
    const deductions = monthlyBasic * 0.15; // 15% tax/deductions
    
    await prisma.payslip.create({
      data: {
        employeeProfileId: profile.id,
        month: "2026-05",
        basicSalary: monthlyBasic,
        allowances: 500,
        deductions: deductions,
        netSalary: monthlyBasic + 500 - deductions,
        status: "PAID"
      }
    });
  }

  console.log("Database seeded successfully! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
