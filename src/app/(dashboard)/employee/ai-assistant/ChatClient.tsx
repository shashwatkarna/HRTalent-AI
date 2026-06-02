"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, BrainCircuit, Loader2 } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "ai";
  content: string;
};

const INITIAL_MESSAGES: Message[] = [
  { id: "1", role: "ai", content: "Hello! I am your AI HR Assistant. You can ask me questions about company policies, your leave balance, payroll details, or benefits. How can I help you today?" }
];

export default function ChatClient({ userName }: { userName: string }) {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    const newMsg: Message = { id: Date.now().toString(), role: "user", content: userMessage };
    setMessages(prev => [...prev, newMsg]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = "I'm sorry, I couldn't find specific information regarding that in the employee handbook. Please reach out to your HR representative directly.";
      
      const lower = userMessage.toLowerCase();
      if (lower.includes("leave") || lower.includes("vacation") || lower.includes("sick")) {
        aiResponse = "According to our policy, you are entitled to 14 days of paid time off per year. You can request leave through the 'Leave Management' tab on your dashboard.";
      } else if (lower.includes("payroll") || lower.includes("salary") || lower.includes("pay")) {
        aiResponse = "Salaries are processed on the last working day of every month. Your payslips are automatically generated and can be downloaded from the 'Payroll' tab.";
      } else if (lower.includes("remote") || lower.includes("wfh") || lower.includes("work from home")) {
        aiResponse = "Our company supports a hybrid work model. Employees can work from home up to 2 days a week, subject to manager approval.";
      } else if (lower.includes("hi") || lower.includes("hello")) {
        aiResponse = `Hello ${userName}! How can I assist you with your HR needs today?`;
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "ai", content: aiResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden relative">
      {/* Header */}
      <div className="bg-slate-900 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-white leading-tight">HR AI Assistant</h2>
            <p className="text-xs text-blue-400 font-medium flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Online
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "user" ? "bg-slate-200 text-slate-600" : "bg-blue-100 text-blue-600"}`}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === "user" 
                ? "bg-blue-600 text-white rounded-tr-sm shadow-md" 
                : "bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm"
            }`}>
              {msg.content}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 rounded-tl-sm shadow-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about policies, payroll, or benefits..."
            className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-6 pr-14 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
          <button 
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>
    </div>
  );
}
