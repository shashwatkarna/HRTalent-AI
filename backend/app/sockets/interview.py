import socketio
import requests
from app.services.ai_service import generate_greeting, process_candidate_answer, generate_final_evaluation

# Create a Socket.IO server with CORS enabled
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

NEXTJS_API_URL = "http://localhost:3000/api/candidate/interview-complete"

@sio.event
async def connect(sid, environ):
    print(f"[Socket] Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"[Socket] Client disconnected: {sid}")

@sio.event
async def start_interview(sid, candidate_data):
    print(f"[Interview] Started for candidate: {candidate_data.get('candidateName', 'Unknown')}")
    try:
        greeting = await generate_greeting(candidate_data)
        await sio.emit("ai_response", {
            "text": greeting,
            "type": "greeting"
        }, to=sid)
    except Exception as e:
        print(f"[Error] AI Greeting failed: {e}")
        await sio.emit("error", {"message": "Failed to initialize AI Agent."}, to=sid)

@sio.event
async def candidate_response(sid, data):
    candidate_text = data.get("text", "")
    history = data.get("history", [])
    candidate_id = data.get("candidateId", "unknown")
    
    print(f"[Candidate] {candidate_text}")
    
    try:
        # Generate next question & metrics
        ai_reply = await process_candidate_answer(candidate_text, history)
        
        await sio.emit("ai_response", {
            "text": ai_reply.get("text"),
            "metrics": ai_reply.get("metrics"),
            "isComplete": ai_reply.get("isComplete", False)
        }, to=sid)
        
        # If interview is complete, trigger final evaluation and update Next.js Database
        if ai_reply.get("isComplete"):
            print(f"[Interview] Concluding interview for candidate {candidate_id}. Generating final evaluation...")
            final_eval = await generate_final_evaluation(history)
            
            # Combine the full transcript text
            transcript = ""
            for msg in history:
                role = "Recruiter" if msg.get("role") == "ai" else "Candidate"
                transcript += f"**{role}:** {msg.get('text')}\n\n"
                
            # Post to Next.js API
            payload = {
                "candidateId": candidate_id,
                "communicationScore": final_eval.get("communicationScore", 0),
                "technicalScore": final_eval.get("technicalScore", 0),
                "confidenceScore": final_eval.get("confidenceScore", 0),
                "finalRecommendation": final_eval.get("finalRecommendation", "Not Recommended"),
                "aiSummary": final_eval.get("aiSummary", ""),
                "transcript": transcript
            }
            
            try:
                # We can't use await requests.post, but since this is async, we can use requests synchronously in a pinch,
                # or better yet use httpx/aiohttp in production. For now, requests.post is fine for localhost communication.
                response = requests.post(NEXTJS_API_URL, json=payload, timeout=10)
                if response.ok:
                    print(f"[Database] Successfully updated Next.js DB for candidate {candidate_id}")
                else:
                    print(f"[Database] Failed to update Next.js DB: {response.text}")
            except Exception as req_e:
                print(f"[Database Error] Could not reach Next.js API: {req_e}")
                
    except Exception as e:
        print(f"[Error] AI Processing failed: {e}")
        await sio.emit("error", {"message": "AI failed to process response."}, to=sid)
