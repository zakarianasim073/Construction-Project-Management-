import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage, User } from '../types';
import { Send, Bot, User as UserIcon, X, Maximize2, Minimize2, Loader2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

interface GeminiChatProps {
  currentUser: User;
  projectContext?: any;
}

const GeminiChat: React.FC<GeminiChatProps> = ({ currentUser, projectContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      parts: [{ text: "Hello! I'm BuildTrack AI, your construction project assistant. How can I help you manage your project today?" }]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      parts: [{ text: input.trim() }]
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: m.parts
      }));

      const systemInstruction = `
        You are BuildTrack AI, a highly intelligent construction project management assistant.
        You are helping ${currentUser.name}, who is a ${currentUser.role} in a construction company.
        
        Current Project Context:
        ${projectContext ? JSON.stringify(projectContext, null, 2) : 'No project selected yet.'}
        
        Guidelines:
        1. Be professional, concise, and helpful.
        2. Use construction terminology appropriate for the role.
        3. provide actionable insights based on the project data if provided.
        4. If the user asks about progress, refer to the project context.
        5. Format your responses using Markdown for better readability.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [...history, userMessage],
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
        }
      });

      const modelResponse: ChatMessage = {
        role: 'model',
        parts: [{ text: response.text || "I'm sorry, I couldn't process that request." }]
      };

      setMessages(prev => [...prev, modelResponse]);
    } catch (error) {
      console.error("Gemini Error:", error);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "I encountered an error while processing your request. Please try again later." }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '72px' : '650px',
              width: isMinimized ? '320px' : '440px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 overflow-hidden mb-6 flex flex-col max-h-[85vh] w-[90vw] md:w-[440px] backdrop-blur-xl"
          >
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm leading-none tracking-tight">BuildTrack Intelligence</h3>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Assistant</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors text-slate-400 hover:text-white"
                  aria-label="Close chat"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 scrollbar-thin"
                >
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                        m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-blue-600'
                      }`}>
                        {m.role === 'user' ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                      </div>
                      <div className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                        <div className={`prose prose-sm max-w-none ${m.role === 'user' ? 'prose-invert' : 'prose-slate'}`}>
                          <ReactMarkdown
                             components={{
                              p: ({ children }) => <p className="mb-0 leading-relaxed font-medium">{children}</p>,
                              ul: ({ children }) => <ul className="my-2 list-disc pl-4 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="my-2 list-decimal pl-4 space-y-1">{children}</ol>,
                            }}
                          >
                            {m.parts[0].text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-4">
                      <div className="w-9 h-9 rounded-2xl bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-5 h-5" />
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-4 shadow-sm">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 bg-white border-t border-slate-100 shrink-0">
                  <div className="relative group">
                    <input 
                      type="text"
                      placeholder="Ask about project timeline, risks or budget..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-600 focus:bg-white outline-none text-sm transition-all shadow-inner"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all disabled:bg-slate-200 disabled:text-slate-400 shadow-xl active:scale-95"
                      aria-label="Send message"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-center gap-2">
                    <Sparkles className="w-3 h-3 text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      Powered by BuildTrack AI
                    </p>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          if (!isOpen) setIsOpen(true);
          setIsMinimized(false);
        }}
        className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_15px_40px_rgba(37,99,235,0.3)] transition-all ${
          isOpen ? 'bg-white text-slate-900 border border-slate-100 rotate-90 scale-90' : 'bg-slate-900 text-white'
        }`}
        aria-label="Toggle BuildTrack AI"
      >
        {isOpen ? <X className="w-8 h-8" /> : <Sparkles className="w-8 h-8" />}
      </motion.button>
    </div>
  );
};

export default GeminiChat;
