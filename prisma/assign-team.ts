import 'dotenv/config';
import { db as prisma } from '../src/lib/prisma';

async function main() {
  console.log("Assigning team members to Mike Manager...");

  // Find Mike Manager (EMP-003)
  const manager = await prisma.employeeProfile.findUnique({
    where: { employeeId: 'EMP-003' }
  });

  if (!manager) {
    throw new Error("Mike Manager not found!");
  }

  // Find Bob (004), Charlie (005), Diana (006)
  const employeesToAssign = ['EMP-004', 'EMP-005', 'EMP-006'];

  for (const empId of employeesToAssign) {
    const emp = await prisma.employeeProfile.update({
      where: { employeeId: empId },
      data: { managerId: manager.id }
    });
    console.log(`Assigned ${emp.employeeId} to manager ${manager.employeeId}`);

    // Generate a pending leave request for them so there's something to approve
    await prisma.leaveRequest.create({
      data: {
        employeeProfileId: emp.id,
        type: "VACATION",
        startDate: new Date(2026, 6, 10), // July 10, 2026
        endDate: new Date(2026, 6, 15),   // July 15, 2026
        reason: "Family trip to the mountains.",
        status: "PENDING"
      }
    });
  }

  console.log("Team assignment complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
