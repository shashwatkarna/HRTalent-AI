import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.resume import router as resume_router
from app.sockets.interview import sio

# Initialize FastAPI App
app = FastAPI(title="AITalent-HR Enterprise Backend")

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://interview.localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "Unified Python Enterprise Backend"}

# Mount API Routers
app.include_router(resume_router)

# Wrap FastAPI app with Socket.IO ASGI App
# This allows both standard HTTP requests and WebSockets to share the same port
socket_app = socketio.ASGIApp(sio, other_asgi_app=app)

if __name__ == "__main__":
    import uvicorn
    # To run this in development: uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
    uvicorn.run("main:socket_app", host="0.0.0.0", port=8000, reload=True)
