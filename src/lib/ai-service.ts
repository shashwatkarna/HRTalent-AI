import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini API client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const RESUME_PARSER_PROMPT = `
You are an expert AI Technical Recruiter.
Analyze the following resume text and compare it against the provided job description.
You MUST return a STRICT JSON object containing the evaluation.
Do NOT wrap the response in markdown blocks like \`\`\`json. Return ONLY the raw JSON string.

The JSON must follow this exact structure:
{
  "name": "Candidate Full Name or null",
  "email": "Candidate Email or null",
  "phone": "Candidate Phone or null",
  "extractedSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Missing Skill 1 from JD"],
  "matchScore": 85, 
  "skillScore": 90, 
  "expScore": 80,   
  "aiRecommendation": "Strongly Recommended",
  "aiSummary": "A 2-3 sentence professional summary justifying the scores and the recommendation."
}
`;

export async function evaluateResumeAgainstJD(resumeText: string, jobDescription: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured in .env");
  }

  const prompt = `${RESUME_PARSER_PROMPT}

JOB DESCRIPTION:
${jobDescription}

RESUME TEXT:
${resumeText}
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    if (response.text) {
      // Clean markdown just in case the LLM ignored the instruction
      const cleanedText = response.text.replace(/```json\n?|\n?```/g, '').trim();
      return JSON.parse(cleanedText);
    }
    throw new Error("AI returned an empty response.");
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    throw error;
  }
}
