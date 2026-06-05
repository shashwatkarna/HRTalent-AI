import socketio
import requests
import tempfile
import os
import edge_tts
from faster_whisper import WhisperModel
from app.services.ai_service import generate_greeting, process_candidate_answer, generate_final_evaluation

# Create a Socket.IO server with CORS enabled
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

print("[System] Loading Faster-Whisper STT Model (base)...")
try:
    whisper_model = WhisperModel("base", device="cpu", compute_type="int8")
    print("[System] Faster-Whisper Model Loaded successfully.")
except Exception as e:
    print(f"[System] Warning: Failed to load Whisper model. Ensure FFmpeg is installed. Error: {e}")
    whisper_model = None

NEXTJS_API_URL = "http://localhost:3000/api/candidate/interview-complete"

async def generate_tts_audio(text: str) -> bytes:
    voice = "en-US-AriaNeural"
    with tempfile.NamedTemporaryFile(delete=False, suffix=".mp3") as temp_audio:
        temp_path = temp_audio.name
    
    communicate = edge_tts.Communicate(text, voice)
    await communicate.save(temp_path)
    
    with open(temp_path, "rb") as f:
        audio_data = f.read()
        
    os.remove(temp_path)
    return audio_data

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
        
        # Generate TTS Audio for the greeting
        try:
            audio_bytes = await generate_tts_audio(greeting)
            await sio.emit("ai_audio", {"audio": audio_bytes}, to=sid)
        except Exception as tts_e:
            print(f"[TTS Error] Greeting TTS failed: {tts_e}")
            
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


@sio.event
async def candidate_audio(sid, data):
    candidate_id = data.get("candidateId", "unknown")
    history = data.get("history", [])
    audio_bytes = data.get("audio")
    
    if not audio_bytes:
        await sio.emit("error", {"message": "No audio received."}, to=sid)
        return
        
    if whisper_model is None:
        await sio.emit("error", {"message": "Speech recognition is currently offline on the server."}, to=sid)
        return
        
    print(f"[Audio] Received audio payload from candidate {candidate_id}, transcribing...")
    
    try:
        # Save raw binary audio to temp file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio:
            temp_audio.write(audio_bytes)
            temp_path = temp_audio.name
            
        # Transcribe
        segments, info = whisper_model.transcribe(temp_path, beam_size=5)
        transcript = " ".join([segment.text for segment in segments]).strip()
        print(f"[Transcript] {transcript}")
        
        # Cleanup
        os.remove(temp_path)
        
        if not transcript:
            await sio.emit("error", {"message": "Could not hear anything clearly. Please try speaking again."}, to=sid)
            return

        # Emit what the user said back to the frontend immediately so they can read it
        await sio.emit("transcription_complete", {"text": transcript}, to=sid)
        
        # Append the new candidate transcript to the history so AI has the context
        history.append({"role": "candidate", "text": transcript})
        
        # Process answer using existing logic
        ai_reply = await process_candidate_answer(transcript, history)
        
        await sio.emit("ai_response", {
            "text": ai_reply.get("text"),
            "metrics": ai_reply.get("metrics"),
            "isComplete": ai_reply.get("isComplete", False)
        }, to=sid)
        
        # Generate TTS Audio for the reply
        try:
            reply_audio = await generate_tts_audio(ai_reply.get("text"))
            await sio.emit("ai_audio", {"audio": reply_audio}, to=sid)
        except Exception as tts_e:
            print(f"[TTS Error] Reply TTS failed: {tts_e}")
        
        # If interview is complete, trigger final evaluation and update Next.js Database
        if ai_reply.get("isComplete"):
            print(f"[Interview] Concluding interview for candidate {candidate_id}. Generating final evaluation...")
            final_eval = await generate_final_evaluation(history)
            
            transcript_text = ""
            for msg in history:
                role = "Recruiter" if msg.get("role") == "ai" else "Candidate"
                transcript_text += f"**{role}:** {msg.get('text')}\n\n"
                
            payload = {
                "candidateId": candidate_id,
                "communicationScore": final_eval.get("communicationScore", 0),
                "technicalScore": final_eval.get("technicalScore", 0),
                "confidenceScore": final_eval.get("confidenceScore", 0),
                "finalRecommendation": final_eval.get("finalRecommendation", "Not Recommended"),
                "aiSummary": final_eval.get("aiSummary", ""),
                "transcript": transcript_text
            }
            
            try:
                response = requests.post(NEXTJS_API_URL, json=payload, timeout=10)
                if response.ok:
                    print(f"[Database] Successfully updated Next.js DB for candidate {candidate_id}")
                else:
                    print(f"[Database] Failed to update Next.js DB: {response.text}")
            except Exception as req_e:
                print(f"[Database Error] Could not reach Next.js API: {req_e}")
                
    except Exception as e:
        print(f"[Audio Error] STT processing failed: {e}")
        await sio.emit("error", {"message": f"Transcription failed: {str(e)}"}, to=sid)

