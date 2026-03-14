import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GENERATION_STEPS, MOCK_GENERATED_GAME } from '@/lib/mockData';

export default function GeneratingPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const runSteps = (step: number) => {
      if (step < GENERATION_STEPS.length) {
        timeout = setTimeout(() => {
          setCurrentStep(step + 1);
          runSteps(step + 1);
        }, GENERATION_STEPS[step].duration);
      } else {
        timeout = setTimeout(() => setDone(true), 800);
      }
    };
    runSteps(0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen bg-background grid-floor scanlines flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-neon-cyan/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-neon-magenta/5 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-lg text-center">
        {!done ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="text-5xl mb-6 animate-pulse-glow">🎮</div>
            <h2 className="font-display text-xl tracking-wider text-foreground mb-8 neon-cyan">
              GENERATING YOUR ARCADE WORLD
            </h2>

            <div className="space-y-3 text-left max-w-sm mx-auto mb-8">
              {GENERATION_STEPS.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2 h-2 rounded-full transition-colors ${
                    i < currentStep ? 'bg-neon-green' : i === currentStep ? 'bg-primary animate-pulse' : 'bg-border'
                  }`} />
                  <span className={`font-body text-sm transition-colors ${
                    i < currentStep ? 'text-neon-green' : i === currentStep ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.text}
                  </span>
                  {i < currentStep && <span className="text-neon-green text-xs ml-auto">✓</span>}
                </motion.div>
              ))}
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-border rounded-full overflow-hidden max-w-sm mx-auto">
              <motion.div
                className="h-full bg-primary"
                initial={{ width: '0%' }}
                animate={{ width: `${(currentStep / GENERATION_STEPS.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-5xl mb-4">🕹️</div>
            <h2 className="font-display text-xl tracking-wider text-neon-green mb-6 neon-green">
              YOUR GAME IS READY
            </h2>

            <div className="bg-card border border-neon-green/30 rounded p-6 border-glow-green text-left mb-6">
              <h3 className="font-display text-lg tracking-wider text-foreground mb-1">{MOCK_GENERATED_GAME.title}</h3>
              <p className="text-xs text-muted-foreground font-body mb-4">Inspired by {MOCK_GENERATED_GAME.inspiration}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-background/50 rounded p-3">
                  <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1">THEME</p>
                  <p className="text-sm font-body text-foreground">{MOCK_GENERATED_GAME.theme}</p>
                </div>
                <div className="bg-background/50 rounded p-3">
                  <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1">DIFFICULTY</p>
                  <p className="text-sm font-body text-foreground">{MOCK_GENERATED_GAME.difficulty}</p>
                </div>
              </div>

              <div className="bg-background/50 rounded p-3 mb-4">
                <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-1">TWIST</p>
                <p className="text-sm font-body text-foreground">{MOCK_GENERATED_GAME.twist}</p>
              </div>

              <p className="text-xs text-muted-foreground font-body">{MOCK_GENERATED_GAME.mechanic}</p>
            </div>

            <button
              onClick={() => navigate('/lobby')}
              className="w-full bg-primary text-primary-foreground font-display text-sm font-bold tracking-wider py-3 rounded border-glow-cyan hover:brightness-110 transition-all"
            >
              ENTER THE ARCADE →
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
