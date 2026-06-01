"use client";

import { useEffect, useState, useRef, use } from "react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, BrainCircuit, Activity, CheckCircle2 } from "lucide-react";

import { useParams } from "next/navigation";

type Message = { role: "ai" | "candidate"; text: string };

export default function VoiceInterviewPage() {
  const params = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [interviewComplete, setInterviewComplete] = useState(false);
  
  // Speech Recognition reference
  const recognitionRef = useRef<any>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Initialize Socket Connection
  useEffect(() => {
    // Connect to our new Dedicated Express Backend
    const newSocket = io("http://localhost:3001");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      setIsConnected(true);
      // Start the interview once connected
      newSocket.emit("start_interview", { 
        name: "Candidate", 
        role: "Software Engineer" 
      });
    });

    newSocket.on("ai_response", (data: { text: string, type?: string, metrics?: any, isComplete?: boolean }) => {
      setIsAiThinking(false);
      
      setMessages(prev => [...prev, { role: "ai", text: data.text }]);
      
      // Simulate Text-to-Speech (TTS)
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(data.text);
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        window.speechSynthesis.speak(utterance);
      }

      if (data.isComplete) {
        setInterviewComplete(true);
      }
    });

    newSocket.on("disconnect", () => setIsConnected(false));
    
    return () => {
      newSocket.close();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  // Initialize Browser Speech Recognition (Web Speech API)
  useEffect(() => {
    if (typeof window !== "undefined" && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleCandidateSpoke(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [messages]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiThinking]);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.start();
        setIsRecording(true);
      } else {
        alert("Your browser does not support Speech Recognition. Please use Chrome/Edge.");
      }
    }
  };

  const handleCandidateSpoke = (transcript: string) => {
    setMessages(prev => [...prev, { role: "candidate", text: transcript }]);
    setIsAiThinking(true);
    
    // Send the transcript and history to the Express Backend via WebSockets
    if (socket) {
      socket.emit("candidate_response", {
        text: transcript,
        history: messages
      });
    }
  };

  if (interviewComplete) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Interview Complete</h2>
          <p className="text-slate-500 mb-8">Thank you for your time. The AI has compiled your evaluation and sent it to the recruiting team.</p>
          <button onClick={() => window.close()} className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            Close Window
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AI Technical Recruiter</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
              {isConnected ? "Connected to Backend (Port 3001)" : "Connecting..."}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          Interview ID: {params?.id}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6 h-[calc(100vh-5rem)]">
        
        {/* Chat Transcript Area */}
        <div 
          ref={chatContainerRef}
          className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 overflow-y-auto space-y-6"
        >
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'ai' 
                  ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm' 
                  : 'bg-blue-600 text-white rounded-tr-sm shadow-lg'
              }`}>
                {msg.role === 'ai' && <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">AI Agent</div>}
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {isAiThinking && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                <Activity className="w-4 h-4 animate-pulse" />
                <span className="text-sm">AI is processing and evaluating...</span>
              </div>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="h-32 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center justify-center shrink-0">
          
          <button 
            onClick={toggleRecording}
            disabled={!isConnected || isAiThinking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? "bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse" 
                : "bg-blue-600 hover:bg-blue-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
          </button>
          
          <p className="text-slate-400 text-sm mt-3 font-medium">
            {isAiThinking ? "Wait for the AI to finish speaking..." : 
             isRecording ? "Listening... Speak now." : "Click to push and speak"}
          </p>
        </div>

      </div>
    </div>
  );
}
