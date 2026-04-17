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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              height: isMinimized ? '64px' : '600px',
              width: isMinimized ? '300px' : '400px'
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-4 flex flex-col max-h-[80vh] w-[90vw] md:w-[400px]"
          >
            {/* Header */}
            <div className="p-4 bg-blue-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-none">BuildTrack AI</h3>
                  <span className="text-[10px] text-blue-100 animate-pulse">Online & Ready</span>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
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
                  className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50"
                >
                  {messages.map((m, i) => (
                    <div 
                      key={i} 
                      className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        m.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white border border-slate-200 text-blue-600 shadow-sm'
                      }`}>
                        {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm ${
                        m.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-none' 
                          : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'
                      }`}>
                        <div className="prose prose-sm max-w-none prose-slate">
                          <ReactMarkdown
                             components={{
                              p: ({ children }) => <p className="mb-0">{children}</p>,
                              ul: ({ children }) => <ul className="my-1 list-disc pl-4">{children}</ul>,
                              ol: ({ children }) => <ol className="my-1 list-decimal pl-4">{children}</ol>,
                            }}
                          >
                            {m.parts[0].text}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-blue-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                      <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3 shadow-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                  <div className="relative">
                    <input 
                      type="text"
                      placeholder="Ask BuildTrack AI..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600 outline-none text-sm transition-all"
                    />
                    <button 
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:bg-slate-300 disabled:shadow-none shadow-lg shadow-blue-200"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 text-center">
                    BuildTrack AI may provide inaccurate information. Check key facts.
                  </p>
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
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${
          isOpen ? 'bg-white text-blue-600 border border-blue-100' : 'bg-blue-600 text-white'
        }`}
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>
    </div>
  );
};

export default GeminiChat;
