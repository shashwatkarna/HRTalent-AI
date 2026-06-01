import { NextRequest, NextResponse } from "next/server";
import pdfParse from "pdf-parse";
import { evaluateResumeAgainstJD } from "@/lib/ai-service";
import { db } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("resume") as File | null;
    const jobId = formData.get("jobId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    if (!jobId) {
      return NextResponse.json({ error: "No jobId provided" }, { status: 400 });
    }

    // 1. Fetch the Job Description from the DB
    const job = await db.jobPosting.findUnique({
      where: { id: jobId }
    });

    if (!job) {
      return NextResponse.json({ error: "Job posting not found" }, { status: 404 });
    }

    // 2. Read the PDF File
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Extract text using pdf-parse
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from the provided PDF." }, { status: 400 });
    }

    // 4. Send to Gemini AI for Evaluation
    const evaluation = await evaluateResumeAgainstJD(resumeText, job.description);

    // 5. Save the candidate and evaluation in the DB
    const candidate = await db.candidate.create({
      data: {
        name: evaluation.name || "Unknown Candidate",
        email: evaluation.email || `unknown-${Date.now()}@example.com`,
        phone: evaluation.phone || null,
        jobPostingId: job.id,
        status: "SCREENED",
        aiEvaluation: {
          create: {
            matchScore: evaluation.matchScore,
            skillScore: evaluation.skillScore,
            experienceScore: evaluation.expScore,
            extractedSkills: evaluation.extractedSkills,
            finalRecommendation: evaluation.aiRecommendation,
            aiSummary: evaluation.aiSummary
            // Missing skills can be added to the schema or just stored in a JSON field if needed
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      evaluation
    });

  } catch (error: any) {
    console.error("Parse Resume API Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
