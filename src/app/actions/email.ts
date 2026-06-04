"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInterviewInvite(candidateId: string, email: string, name: string) {
  try {
    const interviewLink = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/interview/${candidateId}`;
    
    const { data, error } = await resend.emails.send({
      from: 'AITalent-HR <onboarding@resend.dev>', // resend.dev allows sending to verified emails for testing
      to: email,
      subject: 'Invitation to AI Voice Interview',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #4f46e5;">Hello ${name},</h2>
          <p>Congratulations! Your resume has been shortlisted for the position you applied for.</p>
          <p>We would like to invite you to the next step: a technical interview with our AI Recruitment Agent.</p>
          
          <div style="margin: 30px 0;">
            <a href="${interviewLink}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Start AI Interview
            </a>
          </div>
          
          <p>Please ensure you are in a quiet room with a working microphone.</p>
          <p>Best of luck,<br>The HR Team</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send email:", err);
    return { success: false, error: err.message };
  }
}

export async function sendOnboardingCredentials(email: string, tempPassword: string) {
  try {
    const loginLink = `${process.env.NEXT_PUBLIC_SUPABASE_URL || "http://localhost:3000"}/login`;
    
    const { data, error } = await resend.emails.send({
      from: 'AITalent-HR <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to the Team! Your Login Credentials',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Welcome Aboard! 🎉</h2>
          <p>Your offer has been officially approved and your Employee Dashboard has been provisioned.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Login URL:</strong> <a href="${loginLink}">${loginLink}</a></p>
            <p style="margin: 10px 0 0 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 10px 0 0 0;"><strong>Temporary Password:</strong> <code>${tempPassword}</code></p>
          </div>
          
          <p style="color: #ef4444; font-size: 14px;">
            ⚠️ Please log in immediately and change your password for security purposes.
          </p>
          
          <p>We are thrilled to have you on the team!</p>
          <p>Best regards,<br>Management</p>
        </div>
      `
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Failed to send onboarding email:", err);
    return { success: false, error: err.message };
  }
}
