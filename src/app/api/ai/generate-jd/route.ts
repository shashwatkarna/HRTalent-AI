import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `
      You are an expert HR Technical Recruiter. 
      Generate a comprehensive Job Description based on the user's short prompt.
      Return the output strictly as a JSON object with the following structure:
      {
        "title": "Professional Job Title",
        "department": "Engineering, Marketing, Human Resources, or Sales",
        "description": "A detailed 3-4 paragraph description including responsibilities, requirements, and company culture.",
        "skills": "Comma separated string of 5-8 mandatory technical/soft skills"
      }
      Do not include markdown blocks, just return raw JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `${systemPrompt}\n\nPrompt: ${prompt}`,
    });

    // Clean JSON block if Gemini adds markdown backticks
    let rawText = response.text || "{}";
    rawText = rawText.replace(/```json/g, "").replace(/```/g, "").trim();

    const data = JSON.parse(rawText);
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("AI JD Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate Job Description" }, { status: 500 });
  }
}
