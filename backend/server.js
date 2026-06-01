require("dotenv").config({ path: "../.env" });
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const aiService = require("./services/aiService");

const app = express();
app.use(cors({ origin: "http://localhost:3000" }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Basic health check route
app.get("/health", (req, res) => {
  res.json({ status: "AI Voice Backend is running" });
});

// Handle real-time WebSockets for Voice Interviews
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  // Initialize a new interview session
  socket.on("start_interview", async (candidateData) => {
    console.log(`[Interview] Started for candidate: ${candidateData.name || "Unknown"}`);
    
    try {
      const initialGreeting = await aiService.generateGreeting(candidateData);
      socket.emit("ai_response", { 
        text: initialGreeting,
        type: "greeting"
      });
    } catch (err) {
      console.error("[Error] AI Greeting failed:", err);
      socket.emit("error", { message: "Failed to initialize AI Agent." });
    }
  });

  // Handle incoming voice transcriptions
  // Note: In a production app, we would stream raw audio (WebRTC) and transcribe here using Whisper.
  // For the hackathon, we simulate the frontend sending transcribed text chunks or we process text directly.
  socket.on("candidate_response", async (data) => {
    console.log(`[Candidate] ${data.text}`);
    
    try {
      const aiReply = await aiService.processCandidateAnswer(data.text, data.history);
      
      socket.emit("ai_response", {
        text: aiReply.text,
        metrics: aiReply.metrics, // e.g. communication score updates
        isComplete: aiReply.isComplete // True if the interview is finished
      });
    } catch (err) {
      console.error("[Error] AI Processing failed:", err);
      socket.emit("error", { message: "AI failed to process response." });
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`[Server] AI Backend listening on port ${PORT}`);
});
