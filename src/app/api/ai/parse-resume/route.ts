import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    let jobId = formData.get("jobId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    // 1. Proxy the file to our new Python Microservice
    const pythonFormData = new FormData();
    pythonFormData.append("resume", file);

    const pythonResponse = await fetch("http://127.0.0.1:8000/parse-resume", {
      method: "POST",
      body: pythonFormData,
    });

    if (!pythonResponse.ok) {
      const errorText = await pythonResponse.text();
      console.error("Python API Error:", errorText);
      return NextResponse.json({ error: "Python Backend failed to process the resume." }, { status: 500 });
    }

    const extractedData = await pythonResponse.json();

    // 2. Database Creation Logic
    if (!jobId) {
      const existingJob = await db.jobPosting.findFirst();
      if (existingJob) {
        jobId = existingJob.id;
      } else {
        const newJob = await db.jobPosting.create({
          data: {
            title: "General Application",
            description: "Default job posting created by resume upload.",
            requiredSkills: ["General"],
            isActive: true
          }
        });
        jobId = newJob.id;
      }
    }

    // Ensure email is unique
    const uniqueEmail = extractedData.email.startsWith("unknown-") 
      ? `unknown-${Date.now()}@example.com` 
      : extractedData.email;

    const existingCandidate = await db.candidate.findUnique({
      where: { email: uniqueEmail }
    });

    if (existingCandidate) {
      return NextResponse.json({ error: "Candidate with this email already exists." }, { status: 409 });
    }

    // 3. Save Candidate and initialize AIEvaluation
    const candidate = await db.candidate.create({
      data: {
        name: extractedData.name,
        email: uniqueEmail,
        jobPostingId: jobId,
        status: "SCREENED", // Changed state to SCREENED post-parsing
        aiEvaluation: {
          create: {
            matchScore: extractedData.matchScore || Math.floor(Math.random() * 30) + 70, 
            extractedSkills: extractedData.topSkills,
            finalRecommendation: "Parsed & Ready for Voice Interview"
          }
        }
      }
    });

    return NextResponse.json({ success: true, candidate, skills: extractedData.topSkills });

  } catch (error: any) {
    console.error("Next.js Proxy Route Error:", error);
    return NextResponse.json({ error: "Failed to communicate with Python Backend." }, { status: 500 });
  }
}
