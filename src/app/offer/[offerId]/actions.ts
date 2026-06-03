"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function acceptOffer(offerId: string, candidateId: string) {
  // Update the offer status
  await db.offer.update({
    where: { id: offerId },
    data: { status: "ACCEPTED" }
  });

  // Upgrade the candidate status to HIRED
  await db.candidate.update({
    where: { id: candidateId },
    data: { status: "HIRED" }
  });

  revalidatePath(`/offer/${offerId}`);
  revalidatePath("/hr/offers");
}

export async function rejectOffer(offerId: string, candidateId: string) {
  // Update the offer status
  await db.offer.update({
    where: { id: offerId },
    data: { status: "REJECTED" }
  });

  // Mark the candidate status as REJECTED
  await db.candidate.update({
    where: { id: candidateId },
    data: { status: "REJECTED" }
  });

  revalidatePath(`/offer/${offerId}`);
  revalidatePath("/hr/offers");
}
