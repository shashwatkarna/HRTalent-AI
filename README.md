<!-- # AITalent-HR: Next-Gen Enterprise HRMS

**AITalent-HR** is an AI-powered Human Resources Management System designed to automate tedious HR tasks and remove human bias from recruiting. It is built using Next.js, Prisma, Supabase, and Gemini AI.

---

## What Does This Project Do?
Traditional HR software is just a bunch of boring forms and tables. **AITalent-HR** completely reimagines the HR process by injecting Artificial Intelligence into three core areas:

1. **Recruitment:** An AI conducts voice interviews with candidates and scores them automatically.
2. **Employee Support:** An AI chatbot knows the entire company handbook and instantly answers employee questions.
3. **Governance & Bias Detection:** The system transparently logs *why* the AI made a decision to ensure fairness and remove human bias.

---

## The Complete User Flow

The platform has different "views" depending on who logs in:

### 1. The Candidate Flow (Applying for a Job)
- A candidate clicks a link to start their interview: `http://localhost:3000/interview/1234`
- They are connected to the **AI Technical Recruiter** (powered by Gemini via WebSockets).
- The AI speaks to them and asks them technical questions.
- The candidate clicks the microphone, speaks their answer, and the AI instantly evaluates their communication and technical skills.
- The AI automatically grades them and sends the report to the HR team.

### 2. The Admin Flow (The Boss)
- The boss logs in at `http://localhost:3000/login`.
- Because their role in the database is `ADMIN`, they are taken to the **Admin Dashboard**.
- They can view high-level company analytics (Total Employees, Payroll amounts).
- **Employee Management:** They can securely create new accounts for HR Recruiters or Employees. (Public signups are blocked for security).
- **AI Governance:** They can look at the "Audit Log" to see exactly *why* the AI rejected or passed a candidate (e.g., "Rejected because candidate lacks PostgreSQL experience").

### 3. The Employee Flow (The Worker)
- A standard worker logs in.
- Because their role is `EMPLOYEE`, they are taken to the **Employee Dashboard**.
- They can view their available sick days and download payslips.
- **HR Chatbot:** If they want to know "What is our remote work policy?", they click "Ask HR AI". Instead of emailing a human, they chat with an AI that has memorized the company handbook and gives them instant answers.

---

## Technical Architecture
- **Frontend:** Next.js (App Router), TailwindCSS, Lucide Icons.
- **Database:** PostgreSQL (hosted on Supabase), managed via Prisma ORM.
- **Authentication:** Supabase Auth (Strict Role-Based Access Control).
- **Real-Time AI Backend:** A dedicated Node.js + Express + Socket.io server running on Port 3001 to handle real-time voice streaming with Gemini 2.5 Flash. -->
