import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv(dotenv_path="../../.env")

api_key = os.getenv("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

model = genai.GenerativeModel("gemini-2.5-flash")

async def parse_resume_text(text_content: str):
    """
    Parses raw resume text and extracts structured JSON containing the candidate's core details.
    """
    prompt = f"""
    You are an expert HR Resume Parser. Extract the following information from the resume text provided below.
    Return ONLY a raw JSON object with no markdown formatting, no backticks, and exactly these keys:
    {{
      "name": "Full Name",
      "email": "Email Address",
      "topSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
      "matchScore": 85
    }}

    If you cannot find a name, use "Unknown Candidate". 
    If you cannot find an email, generate a fake one like "unknown-xyz@example.com". 
    Extract exactly 5 technical skills.
    Calculate a generic 'matchScore' (0-100) based on how well-structured and experienced the candidate seems.

    RESUME TEXT:
    {text_content[:5000]}
    """
    
    response = model.generate_content(prompt)
    json_string = response.text.strip().replace("```json", "").replace("```", "").strip()
    
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse LLM response as JSON")


async def generate_greeting(candidate_data: dict):
    """
    Generates the initial greeting and first question for the voice interview.
    """
    skills = candidate_data.get("skills", [])
    skills_str = ", ".join(skills) if skills else "Not specified"
    
    prompt = f"""
    You are an AI Technical Recruiter for AITalent-HR. 
    You are conducting a voice interview with a candidate named {candidate_data.get('candidateName', 'the candidate')}.
    
    Their resume has been parsed and they have the following top skills: {skills_str}.
    
    Start the interview by introducing yourself briefly, welcoming them by name, and asking a specific question about one of their skills.
    Keep it conversational, professional, and under 3 sentences so it sounds natural when spoken by TTS.
    """

    response = model.generate_content(prompt)
    return response.text


async def process_candidate_answer(candidate_text: str, chat_history: list):
    """
    Processes the candidate's transcribed answer, updates metrics, and generates the next question.
    """
    context = "Previous Conversation:\n"
    for msg in chat_history:
        role = "Recruiter" if msg.get("role") == "ai" else "Candidate"
        context += f"{role}: {msg.get('text')}\n"

    prompt = f"""
    You are an AI Technical Recruiter. You are currently in the middle of an interview.
    
    {context}
    
    Candidate's Latest Answer: "{candidate_text}"
    
    Task 1: Evaluate the answer and generate the next interview question. 
    - If the interview has been going on for 4+ turns, conclude the interview politely.
    - Ask a relevant technical or behavioral follow-up based on their answer.
    - Keep your response conversational and short (under 3 sentences).

    Task 2: Grade their latest answer on a scale of 1-10 for 'Communication' and 'Technical Confidence'.

    Output your response STRICTLY as a JSON object with this structure:
    {{
      "text": "The spoken response to the candidate",
      "metrics": {{
        "communicationScore": 8,
        "technicalScore": 7
      }},
      "isComplete": false
    }}
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"Gemini Parsing Error: {e}")
        return {
            "text": "Thank you for sharing that. Could you elaborate a bit more?",
            "metrics": {"communicationScore": 5, "technicalScore": 5},
            "isComplete": False
        }


async def generate_final_evaluation(chat_history: list):
    """
    Generates the final comprehensive evaluation after the interview completes.
    """
    context = "Complete Interview Transcript:\n"
    for msg in chat_history:
        role = "Recruiter" if msg.get("role") == "ai" else "Candidate"
        context += f"{role}: {msg.get('text')}\n"
        
    prompt = f"""
    You are a Senior AI Recruiter evaluating a candidate based on the complete voice interview transcript provided below.
    
    {context}
    
    Analyze their performance and return STRICTLY a JSON object with this structure:
    {{
      "communicationScore": 8.5,
      "technicalScore": 7.0,
      "confidenceScore": 8.0,
      "finalRecommendation": "Recommended",
      "aiSummary": "A concise paragraph (3-4 sentences) summarizing their strengths, weaknesses, and overall performance."
    }}
    
    Note: 'finalRecommendation' MUST be one of: "Strongly Recommended", "Recommended", or "Not Recommended".
    """
    
    try:
        response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
        return json.loads(response.text)
    except Exception as e:
        print(f"Final Evaluation Error: {e}")
        return {
            "communicationScore": 0,
            "technicalScore": 0,
            "confidenceScore": 0,
            "finalRecommendation": "Not Recommended",
            "aiSummary": "Failed to generate evaluation due to an error."
        }
