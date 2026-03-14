import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

const TOTAL_QUESTIONS = 4;

export default function OnboardingPage() {
  const { setOnboarded, setUserId, username } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState('');
  const [userMessageCount, setUserMessageCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    startChat();
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!isTyping && !showSummary) {
      inputRef.current?.focus();
    }
  }, [isTyping, showSummary]);

  const startChat = async () => {
    setIsTyping(true);
    try {
      const res = await fetch('/ai/chat/start', { method: 'POST' });
      const data = await res.json();
      setMessages([{ role: 'ai', text: data.message }]);
    } catch {
      setMessages([{ role: 'ai', text: 'SYSTEM ONLINE. AI CURATOR INITIALIZED.\n\nWhat kind of games get your heart pumping?' }]);
    }
    setIsTyping(false);
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setUserMessageCount(prev => prev + 1);
    setIsTyping(true);

    try {
      const res = await fetch('/ai/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: newHistory }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'ai', text: data.message }]);

      if (data.isComplete) {
        setIsComplete(true);
        setTimeout(() => setShowSummary(true), 800);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', text: 'Connection glitch... try again!' }]);
    }
    setIsTyping(false);
  };

  const handleGenerate = async () => {
    try {
      const res = await fetch('/ai/chat/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: messages, username }),
      });
      const data = await res.json();
      if (data.userId) setUserId(data.userId);
    } catch {
      // preferences extraction failed, continue anyway
    }
    setOnboarded(true);
    navigate('/generating');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progress = Math.round((userMessageCount / TOTAL_QUESTIONS) * 100);

  return (
    <div className="h-screen bg-black flex flex-col font-terminal overflow-hidden">

      {/* Header - fixed */}
      <div className="shrink-0 border-b-2 border-primary bg-black px-6 py-3 flex items-center justify-between border-glow-cyan">
        <div className="font-pixel text-[8px] neon-cyan tracking-widest">ARCADIA_AI v2.0</div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_QUESTIONS }).map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 transition-colors ${i < userMessageCount ? 'bg-neon-green' : i === userMessageCount ? 'bg-primary animate-pulse-glow' : 'bg-muted'}`}
              />
            ))}
          </div>
          <span className="font-pixel text-[7px] text-muted-foreground">{Math.min(progress, 100)}%</span>
        </div>
      </div>

      {/* Chat - scrollable */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 min-h-0"
      >
        <div className="max-w-2xl mx-auto space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <span className="font-pixel text-[7px] text-neon-green mr-2 mt-1 shrink-0">AI&gt;</span>
                )}
                <div className={`max-w-[78%] px-4 py-3 text-lg font-terminal border ${
                  msg.role === 'user'
                    ? 'border-primary text-primary bg-primary/8 border-glow-cyan text-right'
                    : 'border-neon-green/40 text-neon-green bg-neon-green/5'
                }`}>
                  {msg.text}
                </div>
                {msg.role === 'user' && (
                  <span className="font-pixel text-[7px] text-primary ml-2 mt-1 shrink-0">&lt;P1</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2"
            >
              <span className="font-pixel text-[7px] text-neon-green">AI&gt;</span>
              <div className="flex gap-1">
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-neon-green"
                    style={{ animation: `pulse-glow 0.8s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* Summary */}
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-primary p-5 border-glow-cyan"
            >
              <div className="font-pixel text-[8px] neon-cyan mb-4 tracking-widest">▓ ARCADE PROFILE COMPUTED ▓</div>
              <p className="text-neon-green font-terminal text-sm mb-5">Your preferences have been analyzed. Ready to generate your personalized arcade experience.</p>
              <button
                onClick={handleGenerate}
                className="w-full bg-primary text-black font-pixel text-[9px] tracking-widest py-4 hover:brightness-125 active:scale-95 transition-all border-glow-cyan"
              >
                ► GENERATE MY GAME ◄
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Input - fixed at bottom */}
      {!isComplete && (
        <div className="shrink-0 border-t-2 border-primary bg-black px-4 py-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              placeholder={isTyping ? 'AI is thinking...' : 'Type your answer...'}
              className="flex-1 bg-black border-2 border-muted text-primary font-terminal text-lg px-4 py-3 outline-none focus:border-primary focus:border-glow-cyan transition-colors placeholder:text-muted-foreground/50"
            />
            <button
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="font-pixel text-[9px] tracking-widest px-6 py-3 border-2 border-primary text-primary hover:bg-primary hover:text-black active:scale-95 transition-all disabled:opacity-30 disabled:cursor-not-allowed border-glow-cyan"
            >
              SEND
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
