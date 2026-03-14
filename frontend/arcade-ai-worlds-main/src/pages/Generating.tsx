import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GENERATION_STEPS, MOCK_GENERATED_GAME } from '@/lib/mockData';

export default function GeneratingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [dots, setDots] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const run = (step: number) => {
      if (step < GENERATION_STEPS.length) {
        timeout = setTimeout(() => { setCurrentStep(step + 1); run(step + 1); }, GENERATION_STEPS[step].duration);
      } else {
        timeout = setTimeout(() => setDone(true), 800);
      }
    };
    run(0);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 400);
    return () => clearInterval(t);
  }, []);

  const pct = Math.round((currentStep / GENERATION_STEPS.length) * 100);
  const filled = Math.round(pct / 5);
  const bar = '█'.repeat(filled) + '░'.repeat(20 - filled);

  return (
    <div className="min-h-screen bg-black pixel-grid crt-flicker flex items-center justify-center p-6 relative overflow-hidden">
      <div className="scanline-bar" />

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center"
            >
              {/* Pulsing icon */}
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

              {/* Steps */}
              <div className="text-left space-y-3 mb-8 font-terminal text-xl">
                {GENERATION_STEPS.map((step, i) => (
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
                      {step.text}{i === currentStep ? dots : ''}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Progress bar */}
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

              <div className="border-2 border-primary p-6 text-left mb-6 border-glow-cyan">
                <div className="font-pixel text-[7px] text-muted-foreground mb-3 tracking-widest">GENERATED FOR YOU</div>
                <h3 className="font-display font-bold text-xl neon-cyan tracking-wider mb-1">{MOCK_GENERATED_GAME.title}</h3>
                <p className="font-terminal text-lg text-muted-foreground mb-5">
                  Inspired by {MOCK_GENERATED_GAME.inspiration}
                </p>

                <div className="grid grid-cols-2 gap-3 font-terminal">
                  {[
                    { label: 'THEME', value: MOCK_GENERATED_GAME.theme },
                    { label: 'DIFFICULTY', value: MOCK_GENERATED_GAME.difficulty },
                  ].map(({ label, value }) => (
                    <div key={label} className="border border-muted p-3">
                      <div className="font-pixel text-[7px] text-muted-foreground mb-1">{label}</div>
                      <div className="text-lg text-foreground">{value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate('/lobby')}
                className="w-full bg-primary text-black font-pixel text-[10px] tracking-widest py-4 hover:brightness-125 active:scale-95 transition-all border-glow-cyan"
              >
                ENTER THE ARCADE  →
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
