"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generateOffer(formData: FormData, candidateId: string) {
  const designation = formData.get("designation") as string;
  const salary = parseFloat(formData.get("salary") as string);
  const joiningDate = new Date(formData.get("joiningDate") as string);

  if (!designation || isNaN(salary) || !joiningDate) {
    throw new Error("Missing required fields for offer");
  }

  // Create the offer in the database
  await db.offer.create({
    data: {
      candidateId,
      designation,
      salary,
      joiningDate,
      status: "PENDING"
    }
  });

  // Revalidate the offers dashboard
  revalidatePath("/hr/offers");
}
