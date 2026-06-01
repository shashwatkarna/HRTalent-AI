import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const candidate = await db.candidate.findUnique({
      where: { id },
      include: {
        aiEvaluation: true
      }
    });

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: candidate.name,
      skills: candidate.aiEvaluation?.extractedSkills || []
    });

  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 });
  }
}
