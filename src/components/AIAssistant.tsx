import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, AlertCircle, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { askAI } from '../services/geminiService';
import { cn } from '../lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAssistantProps {
  transactions: any[];
  budgets: any[];
  userProfile: any;
}

export default function AIAssistant({ transactions, budgets, userProfile }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Hello ${userProfile?.displayName || 'there'}. I have analyzed your recent financial activity. How can I assist you today?`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    // Show button if we're more than 300px from the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 300;
    setShowScrollToBottom(!isAtBottom);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await askAI(input, { transactions, budgets, userProfile });
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        role: 'assistant',
        content: response || "Service unavailable. Please retry.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError('Connection interrupted. Please verify configuration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedClick = (text: string) => {
    setInput(text);
  };

  const SUGGESTIONS = [
    "Spending analysis",
    "Budget status",
    "Saving strategies",
    "Interest rates",
    "Market insights"
  ];

  return (
    <div className="relative h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] max-w-5xl mx-auto">
      {/* Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollToBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToBottom}
            className="fixed bottom-28 right-4 md:bottom-12 md:right-12 z-50 w-12 h-12 bg-white dark:bg-gray-900 border border-gray-100 dark:border-white/10 rounded-full shadow-2xl flex items-center justify-center group hover:bg-indigo-600 dark:hover:bg-indigo-500 transition-all outline-none"
          >
            <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Scrollable View */}
      <div 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-4 md:px-8 pt-8 pb-32 space-y-16 scrollbar-none no-scrollbar scroll-smooth"
      >
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "flex flex-col gap-3",
                message.role === 'user' ? "items-end pl-12 md:pl-24" : "items-start pr-12 md:pr-24"
              )}
            >
              <div className={cn(
                "px-8 py-5 rounded-[2rem] text-[15px] leading-relaxed transition-colors",
                message.role === 'user'
                  ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                  : "bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 text-gray-800 dark:text-gray-100"
              )}>
                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:m-0 prose-strong:font-black prose-p:leading-[1.7]">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              </div>
              <div className={cn(
                "flex items-center gap-3 px-3",
                message.role === 'user' ? "flex-row" : "flex-row-reverse"
              )}>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-500">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="w-[1px] h-3 bg-gray-100 dark:bg-white/10" />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  message.role === 'user' ? "text-indigo-500 dark:text-indigo-400" : "text-purple-500 dark:text-purple-400"
                )}>
                  {message.role === 'user' ? 'Client' : 'Assistant'}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-2"
          >
            <Loader2 className="w-3 h-3 animate-spin text-indigo-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Assistant Brain Working...</span>
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-2xl border border-red-100 dark:border-red-900/20 text-[10px] font-black uppercase tracking-widest text-center"
          >
            {error}
          </motion.div>
        )}

        {/* Input Area Integrated into Flow */}
        <div className="mt-12 pt-12 border-t border-gray-100 dark:border-white/5">
          <div className="flex overflow-x-auto gap-2 pb-6 no-scrollbar">
            {SUGGESTIONS.map((text) => (
              <button
                key={text}
                onClick={() => handleSuggestedClick(text)}
                className="px-5 py-2.5 border border-gray-200 dark:border-white/10 rounded-full text-[9px] font-black uppercase tracking-widest text-gray-400 hover:bg-gray-900 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 transition-all active:scale-95 whitespace-nowrap shrink-0"
              >
                {text}
              </button>
            ))}
          </div>
          
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Inquire about your WealthFlow data..."
              className="w-full pl-0 pr-12 py-6 bg-transparent border-b border-gray-200 dark:border-white/10 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all text-lg text-gray-900 dark:text-white placeholder:text-gray-200 dark:placeholder:text-gray-700 outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-indigo-600 dark:text-indigo-400 hover:scale-110 transition-all disabled:opacity-30 disabled:scale-100"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
          <div className="mt-8 flex flex-col items-center gap-2">
            <p className="text-[9px] text-gray-400 dark:text-gray-600 uppercase tracking-[0.3em] font-black italic">
              Encrypted Financial Assistant
            </p>
            <div className="w-1 h-1 bg-gray-200 dark:bg-white/10 rounded-full" />
          </div>
        </div>

        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
}
