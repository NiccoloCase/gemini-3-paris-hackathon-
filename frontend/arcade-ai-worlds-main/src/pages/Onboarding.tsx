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
  const [answers, setAnswers] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      setMessages([{ role: 'ai', text: 'SYSTEM ONLINE. AI CURATOR INITIALIZED.' }]);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'ai', text: ONBOARDING_QUESTIONS[0].question }]);
      }, 900);
    }, 400);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleAnswer = (answer: string) => {
    addAnswer(answer);
    setAnswers(prev => [...prev, answer]);
    setMessages(prev => [...prev, { role: 'user', text: answer }]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const q = ONBOARDING_QUESTIONS[currentQ];
      if (currentQ < ONBOARDING_QUESTIONS.length - 1) {
        setMessages(prev => [...prev, { role: 'ai', text: q.aiMessage }]);
        setTimeout(() => {
          const next = currentQ + 1;
          setCurrentQ(next);
          setMessages(prev => [...prev, { role: 'ai', text: ONBOARDING_QUESTIONS[next].question }]);
        }, 700);
      } else {
        setMessages(prev => [...prev, { role: 'ai', text: 'PROFILE COMPUTED. GENERATING TASTE VECTOR...' }]);
        setTimeout(() => setShowSummary(true), 900);
      }
    }, 1000);
  };

  const handleGenerate = () => {
    setOnboarded(true);
    navigate('/generating');
  };

  const currentQuestion = ONBOARDING_QUESTIONS[currentQ];
  const progress = Math.round((currentQ / ONBOARDING_QUESTIONS.length) * 100);

  return (
    <div className="min-h-screen bg-black flex flex-col font-terminal">

      {/* Header */}
      <div className="border-b-2 border-primary bg-black px-6 py-3 flex items-center justify-between border-glow-cyan">
        <div className="font-pixel text-[8px] neon-cyan tracking-widest">ARCADIA_AI v2.0</div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            {ONBOARDING_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`w-6 h-1.5 transition-colors ${i < currentQ ? 'bg-neon-green' : i === currentQ ? 'bg-primary animate-pulse-glow' : 'bg-muted'}`}
              />
            ))}
          </div>
          <span className="font-pixel text-[7px] text-muted-foreground">{progress}%</span>
        </div>
      </div>

      {/* Chat */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full"
      >
        <div className="space-y-4">
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
              <div className="flex flex-wrap gap-2 mb-5">
                {answers.map((a, i) => (
                  <span key={i} className="font-pixel text-[7px] px-2 py-1 border border-neon-magenta text-neon-magenta">
                    {a.toUpperCase()}
                  </span>
                ))}
              </div>
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

      {/* Options */}
      <AnimatePresence>
        {!showSummary && !isTyping && currentQ < ONBOARDING_QUESTIONS.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="border-t-2 border-primary bg-black px-4 py-4"
          >
            <div className="max-w-2xl mx-auto flex flex-wrap gap-2 justify-center">
              {currentQuestion.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="font-terminal text-xl px-5 py-2 border border-muted text-muted-foreground hover:border-primary hover:text-primary hover:border-glow-cyan active:bg-primary/10 transition-all"
                >
                  {opt.toUpperCase()}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
