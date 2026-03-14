import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';
import { ONBOARDING_QUESTIONS } from '@/lib/mockData';

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
}

export default function OnboardingPage() {
  const { addAnswer, setOnboarded } = useApp();
  const navigate = useNavigate();
  const [currentQ, setCurrentQ] = useState(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial AI greeting
    setTimeout(() => {
      setMessages([{
        role: 'ai',
        text: "Hey there! 👾 Welcome to ARCADIA. I'm your AI game curator. Let me learn your vibe so I can build something amazing for you."
      }]);
      setTimeout(() => {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: ONBOARDING_QUESTIONS[0].question
        }]);
      }, 800);
    }, 500);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAnswer = (answer: string) => {
    addAnswer(answer);
    setMessages(prev => [...prev, { role: 'user', text: answer }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const q = ONBOARDING_QUESTIONS[currentQ];

      if (currentQ < ONBOARDING_QUESTIONS.length - 1) {
        setMessages(prev => [...prev, { role: 'ai', text: q.aiMessage }]);
        setTimeout(() => {
          const nextQ = currentQ + 1;
          setCurrentQ(nextQ);
          setMessages(prev => [...prev, {
            role: 'ai',
            text: ONBOARDING_QUESTIONS[nextQ].question
          }]);
        }, 600);
      } else {
        setMessages(prev => [...prev, {
          role: 'ai',
          text: "🎯 Got it! Here's what I've learned about you:"
        }]);
        setTimeout(() => {
          setShowSummary(true);
        }, 800);
      }
    }, 1000);
  };

  const handleGenerate = () => {
    setOnboarded(true);
    navigate('/generating');
  };

  const currentQuestion = ONBOARDING_QUESTIONS[currentQ];

  return (
    <div className="min-h-screen bg-background grid-floor scanlines flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-xl px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div>
            <h2 className="font-display text-sm tracking-wider text-primary neon-cyan">ARCADIA AI</h2>
            <p className="text-xs text-muted-foreground font-body">Building your personalized arcade…</p>
          </div>
          <div className="ml-auto flex gap-1">
            {ONBOARDING_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`w-8 h-1 rounded-full transition-colors ${
                  i <= currentQ ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[80%] rounded px-4 py-3 text-sm font-body ${
                  msg.role === 'user'
                    ? 'bg-primary/20 border border-primary/30 text-foreground'
                    : 'bg-card border border-border text-foreground'
                }`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-card border border-border rounded px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Summary card */}
          {showSummary && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border border-primary/30 rounded p-5 border-glow-cyan"
            >
              <h3 className="font-display text-sm tracking-wider text-primary mb-3">YOUR ARCADE PROFILE</h3>
              <p className="text-sm text-muted-foreground font-body mb-4">
                You like arcade action, fast pacing, and cyber-mythic aesthetics. You thrive in chaos and love neon-drenched worlds.
              </p>
              <div className="flex flex-wrap gap-2 mb-5">
                {['Fast-paced', 'Arcade Classic Lover', 'Neon Sci-fi', 'Chaos-friendly', 'Competitive'].map(tag => (
                  <span key={tag} className="text-xs font-display tracking-wider px-3 py-1 rounded-full border border-neon-magenta/50 text-neon-magenta bg-neon-magenta/10">
                    {tag}
                  </span>
                ))}
              </div>
              <button
                onClick={handleGenerate}
                className="w-full bg-primary text-primary-foreground font-display text-sm font-bold tracking-wider py-3 rounded border-glow-cyan hover:brightness-110 transition-all"
              >
                🎮 GENERATE MY GAME
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Options bar */}
      {!showSummary && !isTyping && currentQ < ONBOARDING_QUESTIONS.length && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-border bg-card/50 backdrop-blur-xl px-4 py-4"
        >
          <div className="max-w-2xl mx-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {currentQuestion.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="font-body text-sm px-4 py-2 rounded border border-border bg-card hover:border-primary hover:text-primary transition-colors"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
