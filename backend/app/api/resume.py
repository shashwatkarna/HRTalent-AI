import io
import os
import pdfplumber
from fastapi import APIRouter, UploadFile, File, HTTPException
from pydantic import BaseModel
from app.services.ai_service import parse_resume_text

router = APIRouter()

class ParseResponse(BaseModel):
    name: str
    email: str
    topSkills: list[str]
    matchScore: int

@router.post("/parse-resume", response_model=ParseResponse)
async def parse_resume(resume: UploadFile = File(...)):
    if not resume.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    try:
        file_bytes = await resume.read()
        
        # 1. Extract text using pdfplumber
        text_content = ""
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text_content += extracted + "\n"
                    
        if not text_content.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF.")
            
        # 2. Extract entities using Gemini
        extracted_data = await parse_resume_text(text_content)
        
        return ParseResponse(
            name=extracted_data.get("name", "Unknown Candidate"),
            email=extracted_data.get("email", f"unknown-{os.urandom(4).hex()}@example.com"),
            topSkills=extracted_data.get("topSkills", []),
            matchScore=extracted_data.get("matchScore", 70)
        )
        
    except Exception as e:
        print(f"Error parsing resume: {e}")
        raise HTTPException(status_code=500, detail=str(e))
