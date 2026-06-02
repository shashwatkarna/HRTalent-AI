const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function fixPayroll() {
  console.log("Fetching all users...");
  const users = await prisma.user.findMany();
  
  let totalPayroll = 0;
  
  for (const user of users) {
    // Assign a random salary between $60k and $150k based on role
    let salary = 80000;
    if (user.role === "ADMIN" || user.role === "SENIOR_MANAGER") salary = 140000;
    if (user.role === "HR_RECRUITER") salary = 95000;
    if (user.role === "EMPLOYEE") salary = 65000;
    
    // Add some random variation
    salary += Math.floor(Math.random() * 10000);
    
    totalPayroll += salary;

    await prisma.employeeProfile.upsert({
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
    console.log(`Created profile for ${user.email} with salary $${salary}`);
  }
  
  // Create a terminated employee to give Attrition Rate a real value
  const pastUser = await prisma.user.findFirst({ where: { email: "terminated@aitalent.com" } });
  if (!pastUser) {
    const dummy = await prisma.user.create({
      data: {
        email: "terminated@aitalent.com",
        name: "Terminated Employee",
        role: "EMPLOYEE"
      }
    });
    await prisma.employeeProfile.create({
      data: {
        userId: dummy.id,
        employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
        salary: 60000,
        employmentStatus: "TERMINATED",
        joiningDate: new Date(Date.now() - 31536000000) // 1 year ago
      }
    });
    console.log("Created terminated employee for attrition rate calculation");
  }
  
  console.log(`\nPayroll fixed! Total annual payroll seeded: $${totalPayroll}`);
}

fixPayroll()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
