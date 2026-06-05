"use client";

import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Mic, MicOff, BrainCircuit, Activity, CheckCircle2, Lock } from "lucide-react";
import { useParams } from "next/navigation";

type Message = { role: "ai" | "candidate"; text: string };

export default function VoiceInterviewPage() {
  const params = useParams();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [candidateName, setCandidateName] = useState("Candidate");
  
  // Real-time transcription state
  const [interimText, setInterimText] = useState("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  // SpeechRecognition ref
  const recognitionRef = useRef<any>(null);
  
  // Track backend completion state
  const backendCompletedRef = useRef(false);

  useEffect(() => {
    if (!params?.id) return;

    let newSocket: Socket;

    const fetchCandidate = async () => {
      try {
        const res = await fetch(`/api/candidate/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          // Lock access if interview is already done
          if (data.status !== "SCREENED") {
            setAlreadyCompleted(true);
            return null;
          }
          setCandidateName(data.name);
          return data;
        }
      } catch (err) {
        console.error("Failed to fetch candidate data:", err);
      }
      return null;
    };

    // Setup Web Speech API for real-time visual feedback
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.onresult = (event: any) => {
        let currentTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setInterimText(currentTranscript);
      };
      recognitionRef.current = recognition;
    }

    fetchCandidate().then((candidateData) => {
      if (!candidateData || candidateData.status !== "SCREENED") return;

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      newSocket = io(backendUrl, {
        query: { candidateId: params.id as string }
      });
      setSocket(newSocket);

      newSocket.on("connect", () => {
        setIsConnected(true);
        newSocket.emit("start_interview", { 
          candidateId: params.id,
          candidateName: candidateData.name || "Candidate", 
          skills: candidateData.skills || []
        });
      });

      newSocket.on("ai_response", (data: { text: string, type?: string, metrics?: any, isComplete?: boolean }) => {
        setIsAiThinking(false);
        setMessages(prev => [...prev, { role: "ai", text: data.text }]);
        
        if (data.isComplete) {
          backendCompletedRef.current = true;
        }
      });

      newSocket.on("transcription_complete", (data: { text: string }) => {
        setInterimText(""); // Clear real-time text
        setMessages(prev => [...prev, { role: "candidate", text: data.text }]);
      });

      newSocket.on("ai_audio", (data: { audio: ArrayBuffer }) => {
        try {
          const blob = new Blob([data.audio], { type: "audio/mp3" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          
          setIsAiSpeaking(true);
          
          audio.onended = () => {
            setIsAiSpeaking(false);
            if (backendCompletedRef.current) {
               setInterviewComplete(true);
            }
          };
          
          audio.play();
        } catch (error) {
          console.error("Failed to play AI audio:", error);
          setIsAiSpeaking(false);
        }
      });

      newSocket.on("disconnect", () => setIsConnected(false));
    });
    
    return () => {
      if (newSocket) newSocket.close();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [params?.id]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isAiThinking, interimText]);

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          setIsAiThinking(true);
          
          if (socket) {
            socket.emit("candidate_audio", {
              candidateId: params?.id,
              audio: audioBlob,
              history: messages
            });
          }
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
        setInterimText("");
        
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } catch (err) {
        console.error("Microphone access denied:", err);
        alert("Please allow microphone access to complete the interview.");
      }
    }
  };

  if (alreadyCompleted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-10 rounded-2xl shadow-sm border border-slate-200 max-w-md text-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500 mb-8">This interview link has already been completed or is no longer valid.</p>
        </div>
      </div>
    );
  }

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
      <header className="h-20 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-700 ${
             isAiSpeaking ? 'bg-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.8)]' : 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]'
          }`}>
            <BrainCircuit className={`w-6 h-6 text-white ${isAiSpeaking ? 'animate-pulse' : ''}`} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">AI Technical Recruiter</h1>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
              {isConnected ? "Connected to Backend" : "Connecting..."}
            </div>
          </div>
        </div>
        <div className="text-sm font-medium text-slate-400 bg-slate-800 px-4 py-2 rounded-full border border-slate-700">
          Interview ID: {params?.id}
        </div>
      </header>

      <div className="flex-1 max-w-4xl w-full mx-auto p-6 flex flex-col gap-6 h-[calc(100vh-5rem)]">
        <div ref={chatContainerRef} className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl p-6 overflow-y-auto space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[80%] rounded-2xl p-4 ${
                msg.role === 'ai' 
                  ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm shadow-md' 
                  : 'bg-blue-600 text-white rounded-tr-sm shadow-lg'
              }`}>
                {msg.role === 'ai' && <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">AI Agent</div>}
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
          
          {interimText && (
            <div className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl p-4 bg-blue-600/50 border border-blue-500 text-white/80 rounded-tr-sm shadow-lg animate-pulse">
                <p className="leading-relaxed italic">{interimText}...</p>
              </div>
            </div>
          )}
          
          {isAiThinking && messages.length > 0 && (
            <div className="flex justify-start">
              <div className="bg-slate-800 border border-slate-700 text-slate-400 rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                <Activity className="w-4 h-4 animate-pulse text-blue-400" />
                <span className="text-sm">AI is processing and evaluating...</span>
              </div>
            </div>
          )}
        </div>

        <div className="h-32 bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center justify-center shrink-0">
          <button 
            onClick={toggleRecording}
            disabled={!isConnected || isAiThinking || isAiSpeaking}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              isRecording 
                ? "bg-rose-500 hover:bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.5)] animate-pulse" 
                : "bg-blue-600 hover:bg-blue-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? <Mic className="w-8 h-8 text-white" /> : <MicOff className="w-8 h-8 text-white" />}
          </button>
          
          <p className="text-slate-400 text-sm mt-3 font-medium">
            {isAiSpeaking ? "Listen to the AI's question..." :
             isAiThinking ? "Wait for the AI to finish evaluating..." : 
             isRecording ? "Listening... Speak now." : "Click to push and speak"}
          </p>
        </div>
      </div>
    </div>
  );
}
