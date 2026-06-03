import 'dotenv/config';
import { db as prisma } from '../src/lib/prisma';

async function main() {
  console.log("Seeding Performance Reviews...");

  // Create a new Review Cycle
  const cycle = await prisma.reviewCycle.create({
    data: {
      name: "Q2 2026 Performance Review",
      startDate: new Date(2026, 3, 1), // April 1, 2026
      endDate: new Date(2026, 5, 30),  // June 30, 2026
      status: "OPEN"
    }
  });

  console.log(`Created Review Cycle: ${cycle.name}`);

  // We won't submit any reviews yet, we'll let the user do that through the UI!
  
  console.log("Review Seed complete! 🌱");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
