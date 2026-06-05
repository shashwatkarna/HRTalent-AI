import { db } from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditJobForm from "./EditJobForm";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const job = await db.jobPosting.findUnique({
    where: { id }
  });

  if (!job) return notFound();

  // Convert Prisma JSON array to string array for rendering
  const requiredSkills = Array.isArray(job.requiredSkills) 
    ? (job.requiredSkills as string[]) 
    : [];

  return (
    <EditJobForm 
      job={{
        id: job.id,
        title: job.title,
        description: job.description,
        requiredSkills
      }} 
    />
  );
}
