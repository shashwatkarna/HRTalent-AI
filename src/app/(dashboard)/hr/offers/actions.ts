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
  const offer = await db.offer.create({
    data: {
      candidateId,
      designation,
      salary,
      joiningDate,
      status: "PENDING"
    }
  });

  // Fetch candidate to get email and name for the offer email
  const candidate = await db.candidate.findUnique({
    where: { id: candidateId }
  });

  if (candidate && candidate.email) {
    const { sendOfferEmail } = await import("@/app/actions/email");
    await sendOfferEmail(candidate.email, candidate.name, designation, salary, offer.id);
  }

  // Revalidate the offers dashboard
  revalidatePath("/hr/offers");
}
