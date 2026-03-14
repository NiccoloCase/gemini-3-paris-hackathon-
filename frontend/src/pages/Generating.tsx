import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '@/lib/AppContext';

const STEPS = [
  'Analyzing your vibe...',
  'Designing your world...',
  'Building game mechanics...',
  'Rendering visuals...',
  'Final touches...',
];

export default function GeneratingPage() {
  const navigate = useNavigate();
  const { userId, setGameHtml, setGameName, setGameBackgroundUrl } = useApp();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [dots, setDots] = useState('');

  // Animate steps while waiting
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  // Call the real game generation endpoint
  useEffect(() => {
    if (!userId) {
      setError('No user profile found. Please redo onboarding.');
      return;
    }

    let cancelled = false;

    async function generate() {
      try {
        const res = await fetch('/ai/game-generation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (cancelled) return;

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Generation failed. Please try again.');
          return;
        }

        const data = await res.json();
        setGameHtml(data.html);
        setGameName(data.gameDescription?.split('\n')[0]?.slice(0, 60) || 'Your Game');
        setGameBackgroundUrl(data.backgroundImageUrl || '');
        setCurrentStep(STEPS.length);
        setTimeout(() => { if (!cancelled) setDone(true); }, 600);
      } catch {
        if (!cancelled) setError('Connection error. Please try again.');
      }
    }

    generate();
    return () => { cancelled = true; };
  }, [userId]);

  const pct = done ? 100 : Math.round((currentStep / STEPS.length) * 90);
  const filled = Math.round(pct / 5);
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(20 - filled);

  return (
    <div className="min-h-screen bg-black pixel-grid crt-flicker flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline-bar" />

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="font-pixel text-[10px] text-red-400 tracking-widest mb-6 border border-red-400/30 px-4 py-3">
                {error}
              </div>
              <button
                onClick={() => navigate('/onboarding')}
                className="font-pixel text-[9px] tracking-widest px-6 py-3 border border-primary text-primary hover:bg-primary hover:text-black transition-colors"
              >
                RETRY ONBOARDING
              </button>
            </motion.div>
          ) : !done ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 1.4, repeat: Infinity }}
                className="font-display text-5xl neon-cyan mb-8"
              >
                ⬡
              </motion.div>

              <h2 className="font-display font-bold text-lg neon-cyan tracking-widest mb-8">
                GENERATING YOUR WORLD
              </h2>

              <div className="text-left space-y-3 mb-8 font-terminal text-xl">
                {STEPS.map((step, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0.2 }}
                    animate={{ opacity: i <= currentStep ? 1 : 0.25 }}
                    className="flex items-center gap-3"
                  >
                    <span className={`font-pixel text-[8px] shrink-0 ${
                      i < currentStep ? 'neon-green' : i === currentStep ? 'neon-cyan animate-blink' : 'text-muted-foreground'
                    }`}>
                      {i < currentStep ? '[✓]' : i === currentStep ? '[>]' : '[ ]'}
                    </span>
                    <span className={
                      i < currentStep ? 'text-neon-green' : i === currentStep ? 'text-primary' : 'text-muted-foreground'
                    }>
                      {step}{i === currentStep ? dots : ''}
                    </span>
                  </motion.div>
                ))}
              </div>

              <div className="font-pixel text-[9px] text-primary mb-2 text-center">{pct}%</div>
              <div className="font-pixel text-[9px] neon-cyan tracking-widest text-center">[{bar}]</div>
            </motion.div>
          ) : (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
                className="font-pixel text-[10px] neon-green tracking-widest mb-6 border border-neon-green px-4 py-2 inline-block border-glow-green"
              >
                ★ GAME READY ★
              </motion.div>

              <div className="border-2 border-primary p-6 mb-6 border-glow-cyan text-center">
                <div className="font-pixel text-[7px] text-muted-foreground mb-3 tracking-widest">GENERATED FOR YOU</div>
                <h3 className="font-display font-bold text-xl neon-cyan tracking-wider">Your Arcade World</h3>
              </div>

              <button
                onClick={() => navigate('/lobby')}
                className="w-full bg-primary text-black font-pixel text-[10px] tracking-widest py-4 hover:brightness-125 active:scale-95 transition-all border-glow-cyan"
              >
                ENTER THE ARCADE →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
