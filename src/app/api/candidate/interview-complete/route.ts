import { NextResponse } from "next/server";
import { db } from "@/lib/prisma"; // Changed from prisma to db

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    if (!data.candidateId) {
      return NextResponse.json({ error: "Candidate ID is required" }, { status: 400 });
    }

    // Update the Candidate status to INTERVIEWED
    await db.candidate.update({
      where: { id: data.candidateId },
      data: { status: "INTERVIEWED" }
    });

    // Upsert the AI Evaluation with the new scores and transcript
    await db.aIEvaluation.upsert({
      where: { candidateId: data.candidateId },
      update: {
        interviewTranscript: data.transcript,
        communicationScore: data.communicationScore,
        technicalScore: data.technicalScore,
        confidenceScore: data.confidenceScore,
        finalRecommendation: data.finalRecommendation,
        aiSummary: data.aiSummary
      },
      create: {
        candidateId: data.candidateId,
        interviewTranscript: data.transcript,
        communicationScore: data.communicationScore,
        technicalScore: data.technicalScore,
        confidenceScore: data.confidenceScore,
        finalRecommendation: data.finalRecommendation,
        aiSummary: data.aiSummary
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to complete interview in DB:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
