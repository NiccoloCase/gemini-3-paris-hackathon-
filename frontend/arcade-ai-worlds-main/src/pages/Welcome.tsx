import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';

const STARS = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  delay: (i * 0.17) % 4,
  duration: 2 + (i % 4),
}));

const MARQUEE_TEXT = '★ ARCADIA ★ AI-POWERED ARCADE ★ GENERATE YOUR WORLD ★ PLAY WITH FRIENDS ★ HIGH SCORE ★ ARCADIA ★ AI-POWERED ARCADE ★ GENERATE YOUR WORLD ★ PLAY WITH FRIENDS ★ HIGH SCORE ★ ';

export default function WelcomePage() {
  const { setLoggedIn, setUsername } = useApp();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'attract' | 'enter'>('attract');
  const [name, setName] = useState('');
  const [typed, setTyped] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const subtitle = 'AI-POWERED ARCADE WORLDS';

  useEffect(() => {
    const t = setInterval(() => setTyped(n => (n >= subtitle.length ? 0 : n + 1)), 90);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (mode === 'enter') setTimeout(() => inputRef.current?.focus(), 100);
  }, [mode]);

  const handleStart = () => {
    setUsername(name.trim() || 'PLAYER_ONE');
    setLoggedIn(true);
    navigate('/onboarding');
  };

  const handleGuest = () => {
    setUsername('GUEST_' + String(Math.floor(Math.random() * 9999)).padStart(4, '0'));
    setLoggedIn(true);
    navigate('/onboarding');
  };

  return (
    <div
      className="min-h-screen bg-black pixel-grid crt-flicker flex flex-col items-center justify-center relative overflow-hidden select-none"
      onClick={mode === 'attract' ? () => setMode('enter') : undefined}
      style={{ cursor: mode === 'attract' ? 'pointer' : 'default' }}
    >
      <div className="scanline-bar" />

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {STARS.map(s => (
          <motion.div
            key={s.id}
            className="absolute w-px h-px bg-white"
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            animate={{ opacity: [0.1, 0.7, 0.1] }}
            transition={{ duration: s.duration, repeat: Infinity, delay: s.delay }}
          />
        ))}
      </div>

      {/* Main */}
      <div className="relative z-10 text-center w-full max-w-lg px-6">

        {/* Logo */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1
            className="font-display font-black glitch flex items-center justify-center"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 6rem)', letterSpacing: '0.15em' }}
          >
            <span className="neon-cyan" style={{ marginLeft: '0.15em' }}>A</span>
            <span className="neon-cyan">R</span>
            <span className="neon-cyan">C</span>
            <span className="neon-magenta">A</span>
            <span className="neon-cyan">D</span>
            <span className="neon-cyan">I</span>
            <span className="neon-cyan">A</span>
          </h1>
          <div className="h-8 mt-3 flex items-center justify-center">
            <p className="font-pixel text-[12px] text-neon-yellow tracking-widest">
              {subtitle.slice(0, typed)}
              <span className="animate-blink" style={{ opacity: typed < subtitle.length ? 1 : 0 }}>▌</span>
            </p>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {mode === 'attract' ? (
            <motion.div
              key="attract"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Score board */}
              <div className="flex justify-center gap-12 mb-12">
                {[
                  { label: '1UP', value: '000000', color: 'neon-cyan' },
                  { label: 'HI-SCORE', value: '999999', color: 'neon-yellow' },
                  { label: '2UP', value: '000000', color: 'text-muted-foreground' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="font-pixel text-center">
                    <div className="text-[7px] text-muted-foreground mb-1">{label}</div>
                    <div className={`text-[11px] ${color}`}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Insert coin */}
              <motion.div
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1.1, repeat: Infinity }}
                className="font-pixel text-[11px] neon-yellow tracking-widest mb-8"
              >
                ◄ INSERT COIN ►
              </motion.div>

              <p className="font-pixel text-[7px] text-muted-foreground tracking-widest">
                PRESS ANY KEY TO CONTINUE
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="enter"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Credits bar */}
              <div className="flex justify-between mb-6 font-pixel text-[7px]">
                <span className="text-muted-foreground">CREDIT  01</span>
                <span className="neon-green animate-blink">READY !</span>
              </div>

              {/* Name input */}
              <div className="border border-primary p-5 mb-4 border-glow-cyan">
                <label className="block font-pixel text-[7px] text-muted-foreground mb-4 tracking-widest">
                  ENTER YOUR NAME
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '').slice(0, 10))}
                  onKeyDown={e => e.key === 'Enter' && handleStart()}
                  placeholder="PLAYER_ONE"
                  maxLength={10}
                  className="w-full bg-transparent border-b-2 border-primary text-primary font-pixel text-base tracking-widest text-left pb-2 placeholder:text-primary/25 focus:outline-none"
                  style={{ caretColor: 'hsl(180 100% 50%)' }}
                />
                <div className="font-pixel text-[7px] text-muted-foreground text-right mt-2">
                  {name.length}/10
                </div>
              </div>

              <button
                onClick={handleStart}
                className="w-full bg-primary text-black font-pixel text-[10px] tracking-widest py-4 mb-3 hover:brightness-125 active:scale-95 transition-all border-glow-cyan"
              >
                ► PRESS START ◄
              </button>

              <button
                onClick={handleGuest}
                className="w-full border border-muted text-muted-foreground font-pixel text-[7px] tracking-widest py-3 hover:border-neon-magenta hover:text-neon-magenta transition-colors"
              >
                CONTINUE AS GUEST
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Marquee */}
      <div className="absolute bottom-5 left-0 right-0 overflow-hidden">
        <div className="font-pixel text-[7px] text-muted-foreground/30 animate-marquee">
          {MARQUEE_TEXT}
        </div>
      </div>
    </div>
  );
}
