import { GoogleGenAI, Type, Schema } from "@google/genai";
import { db } from "@/lib/prisma";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Define the schema for our tools
const getEmployeeMasterDossierSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    employeeNameOrId: { type: Type.STRING, description: "The name or exact Employee ID (e.g. EMP-001) of the employee." },
  },
  required: ["employeeNameOrId"],
};

const getLowAttendanceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    threshold: { type: Type.NUMBER, description: "The attendance percentage threshold (e.g., 80)" },
    month: { type: Type.STRING, description: "The month in YYYY-MM format (e.g., 2026-05)" },
  },
  required: ["threshold"],
};

const getPayrollSummarySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    month: { type: Type.STRING, description: "The month in YYYY-MM format (e.g., 2026-05)" },
  },
  required: ["month"],
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages || [];

    // The current user making the request (for employee context)
    const currentUserId = body.userId; 
    let currentEmployeeProfile = null;
    if (currentUserId) {
      currentEmployeeProfile = await db.employeeProfile.findUnique({
        where: { userId: currentUserId },
        include: { user: true }
      });
    }

    const systemInstruction = `You are AITalent Copilot, an advanced HR and Employee assistant.
Your goal is to answer questions using the provided tools.
If the user asks about their own data ("my leaves", "my payslip"), use their Employee ID: ${currentEmployeeProfile?.employeeId || "Unknown"}.
Always respond using Markdown format for readability. Do not mention that you are using tools. Just answer the question directly.`;

    const apiKeys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3
    ].filter(Boolean) as string[];

    if (apiKeys.length === 0) {
      throw new Error("No Gemini API keys configured.");
    }

    let attempt = 0;
    let finalResponseText = "";
    let rateLimitExceededAll = false;

    while (attempt < apiKeys.length) {
      try {
        const ai = new GoogleGenAI({ apiKey: apiKeys[attempt] });
        
        // Execute the initial chat request with the current key
        const chat = ai.chats.create({
          model: "gemini-2.5-flash",
          config: {
            systemInstruction,
            temperature: 0.2,
            tools: tools,
          }
        });

        // Send the user's latest message
        const userMessage = messages[messages.length - 1].content;
        let response = await chat.sendMessage({ message: userMessage });

        // Handle tool calls if Gemini requests them
        if (response.functionCalls && response.functionCalls.length > 0) {
          const toolCall = response.functionCalls[0];
          const name = toolCall.name;
          const args = toolCall.args as any;
          let toolResult: any = {};

          if (name === "get_employee_master_dossier") {
            const profile = await db.employeeProfile.findFirst({
              where: {
                OR: [
                  { employeeId: args.employeeNameOrId },
                  { user: { name: { contains: args.employeeNameOrId, mode: 'insensitive' } } }
                ]
              },
              include: {
                user: true,
                department: true,
                manager: true,
                attendances: { orderBy: { date: 'desc' }, take: 30 },
                leaveRequests: true,
                payslips: { orderBy: { month: 'desc' }, take: 1 }
              }
            });

            if (!profile) {
              toolResult = { error: "Employee not found." };
            } else {
              const totalDays = profile.attendances.length;
              const presentDays = profile.attendances.filter(a => a.status === 'PRESENT').length;
              const attendancePct = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(1) + "%" : "N/A";
              const totalAllowance = 20;
              const leavesTaken = profile.leaveRequests.filter(l => l.status === 'APPROVED').length;
              const pendingLeaves = profile.leaveRequests.filter(l => l.status === 'PENDING').length;
              const latestPayslip = profile.payslips[0];

              toolResult = {
                basic_info: {
                  employeeId: profile.employeeId,
                  name: profile.user.name,
                  email: profile.user.email,
                  contactNumber: profile.contactNumber,
                  role: profile.user.role
                },
                employment_info: {
                  designation: profile.designation,
                  department: profile.department?.name || "None",
                  managerName: profile.manager?.employeeId || "None",
                  status: profile.employmentStatus,
                  joiningDate: profile.joiningDate?.toISOString().split('T')[0],
                  baseSalary: profile.salary
                },
                attendance_summary: {
                  totalWorkingDaysTracked: totalDays,
                  daysPresent: presentDays,
                  daysAbsent: totalDays - presentDays,
                  attendancePercentage: attendancePct
                },
                leave_balances: {
                  totalAnnualAllowance: totalAllowance,
                  leavesTakenThisYear: leavesTaken,
                  leavesRemaining: Math.max(0, totalAllowance - leavesTaken),
                  activePendingRequests: pendingLeaves
                },
                latest_payroll: latestPayslip ? {
                  month: latestPayslip.month,
                  grossSalary: latestPayslip.basicSalary + latestPayslip.allowances,
                  deductions: latestPayslip.deductions,
                  netSalaryPaid: latestPayslip.netSalary
                } : null
              };
            }
          }
          else if (name === "get_low_attendance_employees") {
            const profiles = await db.employeeProfile.findMany({
              include: { user: true, attendances: true }
            });
            const results = profiles.map(p => {
              const total = p.attendances.length;
              const present = p.attendances.filter(a => a.status === 'PRESENT').length;
              const pct = total === 0 ? 100 : (present / total) * 100;
              return { name: p.user.name, percentage: pct.toFixed(1) };
            }).filter(r => parseFloat(r.percentage) < args.threshold);
            toolResult = { employees: results };
          }
          else if (name === "get_payroll_summary") {
            const payslips = await db.payslip.findMany({
              where: { month: args.month },
              include: { employeeProfile: { include: { department: true } } }
            });
            let total = 0;
            let deptBreakdown: Record<string, number> = {};
            payslips.forEach(p => {
              total += p.netSalary;
              const dept = p.employeeProfile.department?.name || "Unknown";
              deptBreakdown[dept] = (deptBreakdown[dept] || 0) + p.netSalary;
            });
            toolResult = { total_payroll: total, department_breakdown: deptBreakdown };
          }

          response = await chat.sendMessage({
            message: [{
              functionResponse: {
                name: name,
                response: toolResult
              }
            }]
          });
        }
        
        // If we get here without an error, the request was successful
        finalResponseText = response.text;
        break; 

      } catch (error: any) {
        if (error.status === 429 || (error.message && error.message.includes("429"))) {
          console.warn(`[Chat API] Key attempt ${attempt + 1} rate limited. Falling back...`);
          attempt++;
          if (attempt >= apiKeys.length) {
            rateLimitExceededAll = true;
          }
        } else {
          // If it's not a rate limit error, throw it to the outer catch
          throw error;
        }
      }
    }

    if (rateLimitExceededAll) {
      return new Response(JSON.stringify({ 
        text: "All API keys are currently rate limited. Please wait 60 seconds and try again." 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ text: finalResponseText }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error: any) {
    console.error("Chat Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
