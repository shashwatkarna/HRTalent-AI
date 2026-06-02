import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { db } from "@/lib/prisma";
// @ts-expect-error - no default export
import pdfParse from "pdf-parse";

// Initialize Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File | null;
    let jobId = formData.get("jobId") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No resume file provided" }, { status: 400 });
    }

    // 1. Read PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let pdfText = "";
    try {
      const pdfData = await pdfParse(buffer);
      pdfText = pdfData.text;
    } catch (parseError) {
      console.error("PDF Parse Error:", parseError);
      return NextResponse.json({ error: "Failed to read the PDF file. Make sure it is a valid text-based PDF." }, { status: 400 });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ error: "Could not extract text from PDF. It may be an image." }, { status: 400 });
    }

    // 2. Use Gemini to Extract Data
    const prompt = `
You are an expert HR Resume Parser. Extract the following information from the resume text provided below.
Return ONLY a raw JSON object with no markdown formatting, no backticks, and exactly these keys:
{
  "name": "Full Name",
  "email": "Email Address",
  "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"]
}

If you cannot find a name, use "Unknown Candidate". If you cannot find an email, generate a fake one like "unknown-xyz@example.com". 
Extract exactly 5 technical skills.

RESUME TEXT:
${pdfText.substring(0, 5000)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let jsonString = response.text || "{}";
    jsonString = jsonString.replace(/```json/g, "").replace(/```/g, "").trim();
    
    let extractedData;
    try {
      extractedData = JSON.parse(jsonString);
    } catch (e) {
      console.error("Failed to parse Gemini response as JSON:", jsonString);
      return NextResponse.json({ error: "AI failed to format extracted data." }, { status: 500 });
    }

    // 3. Save to Database
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

    // Check if candidate exists to avoid unique constraint on email
    const uniqueEmail = extractedData.email === "unknown-xyz@example.com" 
      ? `unknown-${Date.now()}@example.com` 
      : extractedData.email;

    const existingCandidate = await db.candidate.findUnique({
      where: { email: uniqueEmail }
    });

    if (existingCandidate) {
      return NextResponse.json({ error: "Candidate with this email already exists." }, { status: 409 });
    }

    const candidate = await db.candidate.create({
      data: {
        name: extractedData.name,
        email: uniqueEmail,
        jobPostingId: jobId,
        status: "SCREENED", // Automatically mark as screened
        aiEvaluation: {
          create: {
            matchScore: Math.floor(Math.random() * 30) + 70, // Mock score based on parsing
            extractedSkills: extractedData.topSkills,
            finalRecommendation: "Parsed & Ready for Interview"
          }
        }
      }
    });

    return NextResponse.json({ success: true, candidate, skills: extractedData.topSkills });

  } catch (error: any) {
    console.error("Resume Parse Route Error:", error);
    return NextResponse.json({ error: "Failed to process resume." }, { status: 500 });
  }
}
