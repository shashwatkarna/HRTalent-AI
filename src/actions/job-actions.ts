"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createJobPosting(formData: FormData) {
  const title = formData.get("title") as string;
  const department = formData.get("department") as string;
  const description = formData.get("description") as string;
  const skillsString = formData.get("skills") as string;

  if (!title || !description || !skillsString) {
    throw new Error("Missing required fields");
  }

  const requiredSkills = skillsString.split(",").map(s => s.trim()).filter(Boolean);

  await db.jobPosting.create({
    data: {
      title,
      // department isn't explicitly in the schema, but we can store it in description or add it to schema later
      description: `[${department}]\n\n${description}`,
      requiredSkills,
      isActive: true,
    }
  });

  revalidatePath("/hr/jobs");
  redirect("/hr/jobs");
}

export async function toggleJobStatus(jobId: string, currentStatus: boolean) {
  try {
    await db.jobPosting.update({
      where: { id: jobId },
      data: { isActive: !currentStatus }
    });

    revalidatePath("/hr/jobs");
    revalidatePath("/careers");
    revalidatePath(`/careers/${jobId}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to toggle job status:", error);
    return { error: "Failed to toggle job status" };
  }
}
