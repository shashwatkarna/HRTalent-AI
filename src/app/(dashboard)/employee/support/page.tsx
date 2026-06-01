"use client";

import { useState, useRef, useEffect } from "react";
import { Send, BotMessageSquare, User, Loader2, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Message = { role: "user" | "ai"; content: string };

export default function HRSupportChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Hello! I am your AI HR Assistant. I can help you with questions about leave policies, benefits, payroll, and more. How can I assist you today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => scrollToBottom(), [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!response.ok) throw new Error("Network response was not ok");
      
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);

      setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages((prev) => [...prev, { role: "ai", content: "I'm sorry, I'm having trouble connecting to the HR database right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <BotMessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AI HR Assistant</h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Online & Ready to Help
            </div>
          </div>
        </div>
        <Link href="/employee">
          <Button variant="outline" className="text-slate-900 bg-white border-transparent hover:bg-slate-100">
            Back to Dashboard
          </Button>
        </Link>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-b border-blue-100 p-3 text-xs text-blue-700 flex items-center justify-center gap-2 shrink-0 font-medium">
        <Info className="w-4 h-4" />
        This is an automated AI. For highly sensitive matters, please contact your human HR representative.
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="flex gap-4 max-w-[80%]">
              
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <BotMessageSquare className="w-5 h-5" />
                </div>
              )}

              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-sm shadow-md' 
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              </div>

              {msg.role === 'user' && (
                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                  <User className="w-5 h-5" />
                </div>
              )}

            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-4 max-w-[80%]">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <BotMessageSquare className="w-5 h-5" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-500 rounded-tl-sm shadow-sm flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Thinking...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 bg-white border-t border-slate-200 shrink-0">
        <form onSubmit={handleSubmit} className="flex items-end gap-3 relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="E.g. What is our remote work policy? How many sick days do I get?"
            className="flex-1 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-xl flex items-center justify-center transition-colors disabled:opacity-50 shadow-md absolute right-1.5 bottom-1.5"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
      
    </div>
  );
}
