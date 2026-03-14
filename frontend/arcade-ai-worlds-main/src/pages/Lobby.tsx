import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_GENERATED_GAME } from '@/lib/mockData';
import AppShell from '@/components/AppShell';
import { useApp } from '@/lib/AppContext';

/* ── Cabinet config ── */
const CABINETS = [
  {
    side: 'left' as const,
    bottom: '8%',
    offset: '2%',
    rotateY: 28,
    delay: 0.3,
    color: '#ff2d95',
    colorHsl: 'hsl(330, 100%, 57%)',
    label: 'NEON BLITZ',
    sideColor: '#1f0818',
    screenAnim: 1.8,
  },
  {
    side: 'left' as const,
    bottom: '16%',
    offset: '20%',
    rotateY: 15,
    delay: 0.45,
    color: '#00e5ff',
    colorHsl: 'hsl(187, 100%, 50%)',
    label: 'CYBER DRIFT',
    sideColor: '#081418',
    screenAnim: 2.4,
  },
  {
    side: 'right' as const,
    bottom: '8%',
    offset: '2%',
    rotateY: -28,
    delay: 0.35,
    color: '#ffe500',
    colorHsl: 'hsl(54, 100%, 50%)',
    label: 'PIXEL WARS',
    sideColor: '#18160a',
    screenAnim: 2.0,
  },
  {
    side: 'right' as const,
    bottom: '16%',
    offset: '20%',
    rotateY: -15,
    delay: 0.5,
    color: '#39ff14',
    colorHsl: 'hsl(110, 100%, 54%)',
    label: 'GRID RACER',
    sideColor: '#0a180a',
    screenAnim: 2.8,
  },
];

/* ── 3D Arcade Cabinet ── */
function ArcadeCabinet({
  color,
  label,
  sideColor,
  rotateY,
  delay,
  screenAnim,
}: {
  color: string;
  label: string;
  sideColor: string;
  rotateY: number;
  delay: number;
  screenAnim: number;
}) {
  const facingLeft = rotateY > 0;
  const W = 180;
  const H = 280;
  const D = 28;

  return (
    <motion.div
      initial={{ opacity: 0, y: 80, scale: 0.7 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      style={{ width: W, height: H, perspective: 900, transformStyle: 'preserve-3d' }}
    >
      {/* Idle hover */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: delay + 1 }}
        style={{ width: '100%', height: '100%', transformStyle: 'preserve-3d', transform: `rotateY(${rotateY}deg)` }}
      >
        {/* ── Front ── */}
        <div
          className="absolute inset-0 rounded-t-lg overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            background: 'linear-gradient(180deg, #111119 0%, #08080e 100%)',
            border: '1.5px solid rgba(255,255,255,0.07)',
            boxShadow: `0 0 40px ${color}15, inset 0 0 20px rgba(0,0,0,0.5)`,
          }}
        >
          {/* Marquee */}
          <motion.div
            animate={{ boxShadow: [`0 4px 20px ${color}44`, `0 4px 35px ${color}88`, `0 4px 20px ${color}44`] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="w-full flex items-center justify-center"
            style={{
              height: '16%',
              background: `linear-gradient(180deg, ${color}, ${color}99)`,
              borderBottom: '3px solid rgba(0,0,0,0.5)',
            }}
          >
            <span
              className="font-pixel text-[9px] text-black tracking-[0.25em] font-bold"
              style={{ textShadow: '0 1px 0 rgba(255,255,255,0.4)' }}
            >
              {label}
            </span>
          </motion.div>

          {/* Screen */}
          <div className="relative mx-3 mt-3 rounded-sm overflow-hidden" style={{ height: '40%' }}>
            {/* Base glow */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at center, ${color}55 0%, ${color}15 60%, #000 100%)`,
                boxShadow: `inset 0 0 40px ${color}33`,
              }}
            />
            {/* Screen flicker */}
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.4, 0.8, 0.5, 0.9, 0.4] }}
              transition={{ duration: screenAnim, repeat: Infinity, ease: 'linear' }}
              style={{ background: `radial-gradient(circle at 50% 40%, ${color}66 0%, transparent 70%)` }}
            />
            {/* Scanlines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.2) 2px, rgba(0,0,0,0.2) 4px)`,
              }}
            />
            {/* Moving scan bar */}
            <motion.div
              className="absolute inset-x-0 h-[15%] pointer-events-none"
              animate={{ top: ['-15%', '115%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear', delay: delay }}
              style={{ background: `linear-gradient(180deg, transparent, ${color}22, transparent)` }}
            />
            {/* Fake game content */}
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-2 p-3">
              <motion.div
                animate={{ width: ['55%', '70%', '55%'] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="h-[4px] rounded-full"
                style={{ background: `${color}88` }}
              />
              <motion.div
                animate={{ width: ['35%', '50%', '35%'] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="h-[4px] rounded-full"
                style={{ background: `${color}55` }}
              />
              <motion.div
                animate={{ width: ['45%', '30%', '45%'] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                className="h-[4px] rounded-full"
                style={{ background: `${color}66` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div
            className="mx-3 mt-3 rounded-sm flex items-center justify-center gap-4"
            style={{ height: '14%', background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.04)' }}
          >
            {/* Joystick */}
            <div className="flex flex-col items-center gap-[2px]">
              <div className="w-[4px] h-[14px] rounded-full bg-white/25" />
              <div className="w-[10px] h-[10px] rounded-full bg-white/10 border border-white/20" />
            </div>
            {/* Buttons */}
            <div className="flex gap-2">
              <motion.div
                animate={{ boxShadow: [`0 0 3px ${color}44`, `0 0 8px ${color}99`, `0 0 3px ${color}44`] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-[9px] h-[9px] rounded-full"
                style={{ background: `${color}77` }}
              />
              <div className="w-[9px] h-[9px] rounded-full bg-white/10" />
              <div className="w-[9px] h-[9px] rounded-full bg-white/10" />
            </div>
          </div>

          {/* Coin slot */}
          <div className="flex justify-center mt-3">
            <div className="w-[24px] h-[5px] rounded-full bg-white/[0.06] border border-white/[0.05]" />
          </div>
        </div>

        {/* ── Side Panel ── */}
        <div
          className="absolute top-0"
          style={{
            width: D,
            height: H,
            background: `linear-gradient(180deg, ${sideColor} 0%, #030306 100%)`,
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '2px',
            transformOrigin: facingLeft ? `${W}px 0` : '0 0',
            transform: facingLeft ? `translateX(${W}px) rotateY(90deg)` : `translateX(-${D}px) rotateY(-90deg)`,
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Side neon strip */}
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-[15%] bottom-[30%] w-[2px] rounded-full"
            style={{
              left: facingLeft ? 4 : undefined,
              right: facingLeft ? undefined : 4,
              background: color,
              boxShadow: `0 0 6px ${color}, 0 0 12px ${color}66`,
            }}
          />
        </div>

        {/* ── Top Panel ── */}
        <div
          className="absolute left-0"
          style={{
            width: W,
            height: D,
            background: `linear-gradient(180deg, ${sideColor} 0%, #0a0a12 100%)`,
            border: '1px solid rgba(255,255,255,0.03)',
            borderRadius: '3px 3px 0 0',
            transformOrigin: '0 0',
            transform: 'rotateX(90deg)',
            backfaceVisibility: 'hidden',
          }}
        />
      </motion.div>
    </motion.div>
  );
}

export default function LobbyPage() {
  const navigate = useNavigate();
  const { username } = useApp();

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] relative overflow-hidden bg-black flex flex-col">

        {/* ── ARCADIA ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 text-center mt-10 sm:mt-14"
        >
          <motion.h1
            animate={{
              textShadow: [
                '0 0 10px hsl(180,100%,50%), 0 0 40px hsl(180,100%,50%,0.6), 0 0 80px hsl(180,100%,50%,0.3), 0 0 120px hsl(180,100%,50%,0.15)',
                '0 0 15px hsl(180,100%,50%), 0 0 50px hsl(180,100%,50%,0.7), 0 0 100px hsl(180,100%,50%,0.4), 0 0 150px hsl(180,100%,50%,0.2)',
                '0 0 10px hsl(180,100%,50%), 0 0 40px hsl(180,100%,50%,0.6), 0 0 80px hsl(180,100%,50%,0.3), 0 0 120px hsl(180,100%,50%,0.15)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="font-display text-6xl sm:text-8xl font-bold tracking-[0.3em] text-cyan-400"
          >
            ARCADIA
          </motion.h1>
        </motion.div>

        {/* ── FLOOR + CABINETS + HUB ── */}
        <div className="flex-1 relative" style={{ perspective: '600px' }}>
          {/* Grid floor */}
          <div
            className="absolute inset-x-0 bottom-0 h-[80%] origin-bottom"
            style={{
              transform: 'rotateX(55deg)',
              background: `
                repeating-linear-gradient(90deg, transparent, transparent calc(50% - 1px), hsl(180 100% 50% / 0.08) calc(50% - 1px), hsl(180 100% 50% / 0.08) calc(50%), transparent calc(50%)) 0 0 / 80px 80px,
                repeating-linear-gradient(0deg, transparent, transparent calc(50% - 1px), hsl(180 100% 50% / 0.06) calc(50% - 1px), hsl(180 100% 50% / 0.06) calc(50%), transparent calc(50%)) 0 0 / 80px 80px,
                linear-gradient(180deg, #050510 0%, #0a0a1a 100%)
              `,
            }}
          />
          {/* Horizon fade */}
          <div
            className="absolute inset-x-0 bottom-0 h-[80%] origin-bottom pointer-events-none"
            style={{ transform: 'rotateX(55deg)', background: 'linear-gradient(180deg, rgba(0,0,0,0.85) 0%, transparent 35%)' }}
          />

          {/* ── CABINETS ── */}
          {CABINETS.map((cab, i) => (
            <div
              key={i}
              className="absolute hidden sm:block"
              style={{ [cab.side]: cab.offset, bottom: cab.bottom }}
            >
              <ArcadeCabinet
                color={cab.color}
                label={cab.label}
                sideColor={cab.sideColor}
                rotateY={cab.rotateY}
                delay={cab.delay}
                screenAnim={cab.screenAnim}
              />
              {/* Floor light pool */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: cab.delay + 0.5 }}
                className="absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{
                  width: 220,
                  height: 40,
                  borderRadius: '50%',
                  background: `radial-gradient(ellipse, ${cab.color}22 0%, transparent 70%)`,
                  filter: 'blur(8px)',
                }}
              />
            </div>
          ))}

          {/* ── CENTRAL HUB ── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-x-0 top-[12%] sm:top-[18%] z-20 flex flex-col items-center gap-5 px-4"
          >
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.08] rounded-lg px-6 py-4 text-center max-w-sm w-full">
              <p className="font-pixel text-[7px] text-muted-foreground/50 tracking-[0.3em] mb-2">NOW PLAYING</p>
              <h2 className="font-display text-xl sm:text-2xl tracking-wider text-foreground neon-cyan">
                {MOCK_GENERATED_GAME.title}
              </h2>
              <p className="text-xs text-muted-foreground/60 font-body mt-1">
                Inspired by {MOCK_GENERATED_GAME.inspiration} &middot; {MOCK_GENERATED_GAME.theme}
              </p>
            </div>

            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 0 25px hsl(180,100%,50%,0.4)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/play')}
                className="bg-primary text-black font-pixel text-[10px] tracking-widest px-8 sm:px-10 py-3 border-glow-cyan transition-colors"
              >
                ► PLAY
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/[0.04] text-foreground/80 font-pixel text-[10px] tracking-widest px-6 sm:px-8 py-3 border border-white/[0.1] hover:bg-white/[0.08] transition-colors"
              >
                HIGH SCORES
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* ── BOTTOM BAR ── */}
        <div className="relative z-30 h-9 bg-black/80 border-t border-white/[0.05] flex items-center justify-between px-6">
          <span className="font-pixel text-[6px] text-muted-foreground tracking-widest">{username} &bull; CREDITS: 99</span>
          <span className="font-pixel text-[6px] neon-green">8 ONLINE</span>
        </div>
      </div>
    </AppShell>
  );
}
