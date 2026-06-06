# AITalent-HR: Architecture & Developer Documentation

Welcome to the **AITalent-HR** technical documentation. This guide is intended for developers to understand the system architecture, technology stack, and how to operate the application.

---

## 1. High-Level Architecture

AITalent-HR uses a **Split-Stack Architecture** to achieve high-performance UI rendering alongside persistent, low-latency AI streaming.

The system is divided into two main services:
1. **The Frontend (Next.js):** Handles user interfaces, routing, databases, authentication, and standard HTTP requests.
2. **The Real-Time AI Backend (Python/FastAPI):** Exclusively handles persistent WebSocket connections for real-time voice streaming with Google's Gemini AI.

### Architecture Diagram

```mermaid
graph TD
    User([User / Candidate]) -->|HTTPS (Port 443)| Vercel[Next.js Frontend on Vercel]
    User -->|WSS (WebSockets)| Railway[Python FastAPI on Railway]
    
    subgraph Frontend [Next.js App Router]
        Vercel -->|Prisma ORM| SupabaseDB[(Supabase PostgreSQL)]
        Vercel -->|Auth API| SupabaseAuth[Supabase Auth]
    end
    
    subgraph Backend [Python AI Backend]
        Railway <-->|Socket.io| VoiceService[Real-Time Voice Processor]
        VoiceService <-->|API Calls| Gemini[Google Gemini 2.5 Flash]
    end
```

---

## 2. Technology Stack

### Frontend & Core
* **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
* **Language:** TypeScript
* **Styling:** TailwindCSS + Lucide Icons
* **Database ORM:** [Prisma](https://www.prisma.io/)

### Backend (Real-Time AI)
* **Framework:** [FastAPI](https://fastapi.tiangolo.com/) + Uvicorn
* **WebSockets:** [Socket.IO](https://socket.io/) (python-socketio)
* **AI Provider:** Google Generative AI (Gemini Flash)

### Infrastructure & Deployment
* **Database Hosting:** Supabase (PostgreSQL)
* **Frontend Hosting:** Vercel (Serverless Edge Network)
* **Backend Hosting:** Railway (Persistent Containerized Deployments)

---

## 3. Data Flow & Authentication

### Role-Based Access Control (RBAC)
Authentication is strictly handled by Supabase Auth. We utilize database-level Roles to restrict access:
* `ADMIN`: Can access the Governance Dashboard, view total payroll, and invite new employees.
* `MANAGER`: Can view performance reviews, candidates, and manage departments.
* `EMPLOYEE`: Can view their own profile, submit sick leave, and chat with the HR Bot.

### The AI Interview Flow
1. The Next.js frontend generates a unique interview link.
2. The Candidate visits the link. Next.js fetches the candidate's Resume data via Prisma.
3. The frontend establishes a direct Socket.IO connection to the Python Backend (`NEXT_PUBLIC_BACKEND_URL`).
4. The candidate speaks into their microphone. The audio is streamed via WebSockets to Python.
5. Python forwards the audio to Gemini, which generates a response and sends it back down the WebSocket.
6. Once the interview concludes, Python sends the final evaluation JSON back to Next.js, which saves the score to Supabase via Prisma.

---

## 4. AI Models & Features

Our platform leverages multiple AI models and techniques to provide a seamless HR experience:

### 1. Real-Time AI Voice Recruiter (Backend)
* **Models:** OpenAI Whisper (Speech-to-Text) + Google Gemini 2.5 Flash (LLM)
* **Architecture:** Python FastAPI + WebSockets + `faster_whisper`
* **Usage:** Conducts live audio interviews with candidates. The system pipelines audio chunks through OpenAI's Whisper model for extremely fast, highly accurate speech transcription. The transcribed text is immediately fed into Gemini Flash to generate an intelligent conversational response, creating a seamless, human-like voice interview experience with near-zero latency.

### 2. Job Description (JD) Generator (Frontend)
* **Model:** Google Generative AI (Gemini Pro/Flash)
* **Architecture:** Next.js Server Actions (`@google/genai` SDK)
* **Usage:** Allows HR Managers to instantly draft professional, bias-free job descriptions by simply inputting a job title. It automatically formats the output into Markdown.

### 3. Employee HR Support Chatbot (Frontend)
* **Model:** Google Generative AI
* **Architecture:** Next.js API Routes / Server Actions
* **Usage:** Acts as an instant-reply HR agent for employees, capable of answering questions regarding company policy, remote work, and handbook guidelines without requiring human HR intervention.

---

## 5. Local Development Guide

To work on this project locally, you must run both the Frontend and the Backend simultaneously.

### Prerequisites
* Node.js (v18+)
* Python (3.10+)
* PostgreSQL Database (Supabase recommended)

### Environment Setup

**1. Root `.env` (Next.js)**
```env
DATABASE_URL="postgresql://...:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://...:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
SUPABASE_SERVICE_ROLE_KEY="..."
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
RESEND_API_KEY="..."
```

**2. Backend `.env`**
```env
GEMINI_API_KEY="..."
```

### Running the Services

**Terminal 1: Start the Frontend**
```bash
npm install
npx prisma generate
npm run dev
```
*Frontend runs on `http://localhost:3000`*

**Terminal 2: Start the Python Backend**
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # (On Windows)
pip install -r requirements.txt
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
```
*Backend runs on `ws://localhost:8000`*

---

## 6. Deployment Guide

### Database Migrations
Always push schema changes using the direct connection to bypass pgbouncer limitations:
```bash
$env:DATABASE_URL=$env:DIRECT_URL; npx prisma db push --accept-data-loss
```

### Deploying the Backend (Railway)
1. Deploy from GitHub to Railway.
2. Set Root Directory to `/backend`.
3. Set Start Command to `uvicorn main:socket_app --host 0.0.0.0 --port $PORT`.
4. Add `GEMINI_API_KEY` to environment variables.
5. Generate a public domain (e.g., `https://backend.up.railway.app`).

### Deploying the Frontend (Vercel)
1. Deploy from GitHub to Vercel.
2. Ensure Framework Preset is `Next.js`.
3. Add all `.env` variables.
4. Set `NEXT_PUBLIC_BACKEND_URL` to your new Railway WebSocket URL (e.g., `wss://backend.up.railway.app`).
5. Set `NEXT_PUBLIC_SITE_URL` to your generated Vercel domain.
6. Deploy!
