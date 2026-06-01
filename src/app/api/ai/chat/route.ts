import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK with the API Key
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_PROMPT = `
You are the official AI HR Assistant for AITalent-HR. 
You are speaking with an employee. Your job is to answer their HR-related questions accurately based on the company handbook below.

COMPANY HANDBOOK:
- Annual Leave: Employees get 20 days of paid annual leave per year.
- Sick Leave: Employees get 10 paid sick days per year. A doctor's note is required for 3+ consecutive days.
- Maternity Leave: 16 weeks of fully paid leave.
- Paternity Leave: 4 weeks of fully paid leave.
- Working Hours: Flexible, but core hours are 10:00 AM to 3:00 PM in the employee's local timezone.
- Remote Work: Up to 3 days remote per week, pending manager approval.
- Payroll: Salaries are paid on the last business day of every month.
- Health Insurance: Comprehensive coverage provided by BlueCross. Dependents can be added during open enrollment in November.

RULES:
1. Be polite, professional, and empathetic.
2. If the employee asks a question NOT covered by the handbook above, apologize and say they must contact human.resources@aitalent.com. DO NOT make up policies.
3. Keep answers concise (under 4 sentences).
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = body; // Array of { role, content }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // Format history for Gemini
    let conversationContext = "Conversation History:\n";
    messages.forEach((msg: any) => {
      conversationContext += `${msg.role === 'user' ? 'Employee' : 'HR Assistant'}: ${msg.content}\n`;
    });

    const finalPrompt = `${SYSTEM_PROMPT}\n\n${conversationContext}\nHR Assistant:`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: finalPrompt,
    });

    return NextResponse.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 });
  }
}
