"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react";

type Message = { role: "user" | "model"; content: string; isError?: boolean };

export default function EmployeeAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", content: "Hello! I am your AITalent HR Copilot. I can help you with your attendance, leave balances, payslips, or any HR-related questions. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const newMessages = [...messages, { role: "user", content: input.trim() } as Message];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          // If we had authentication context in this component, we would pass userId here
          // userId: "current_user_id"
        })
      });

      if (!response.ok) throw new Error("Failed to fetch response");

      const data = await response.json();
      
      setMessages([...newMessages, { role: "model", content: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages([...newMessages, { role: "model", content: "Sorry, I encountered an error while trying to process your request.", isError: true }]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] max-w-4xl mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-600" />
            AI HR Assistant
          </h1>
          <p className="text-slate-500 mt-1">Ask me about your leaves, payroll, or company policies.</p>
        </div>
      </div>

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col relative">
        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              
              {/* Avatar */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "user" ? "bg-indigo-600 text-white" : "bg-slate-100 text-indigo-600 border border-slate-200"
              }`}>
                {msg.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                msg.role === "user" 
                  ? "bg-indigo-600 text-white rounded-tr-none" 
                  : msg.isError 
                    ? "bg-rose-50 text-rose-700 border border-rose-200 rounded-tl-none"
                    : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
              }`}>
                {msg.isError && <AlertCircle className="w-4 h-4 mb-2" />}
                <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-4 flex-row">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-slate-100 text-indigo-600 border border-slate-200">
                <Bot className="w-5 h-5" />
              </div>
              <div className="max-w-[80%] rounded-2xl px-5 py-3.5 bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none flex items-center gap-1.5">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              disabled={isLoading}
              className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-3 text-xs text-slate-400">
            AITalent Copilot can make mistakes. Consider verifying important information.
          </div>
        </div>
      </div>
    </div>
  );
}
