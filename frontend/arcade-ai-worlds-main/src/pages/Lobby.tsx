import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_GENERATED_GAME } from '@/lib/mockData';
import AppShell from '@/components/AppShell';
import { useApp } from '@/lib/AppContext';

/* ═══════════════════════════════════════════════════
   ONE-POINT PERSPECTIVE ROOM

   Ceiling:  (0,0) ──────────────── (100,0)
              ╲                        ╱
               (20,20) ──── (80,20)    ← back wall top
                │                │
               (20,58) ──── (80,58)    ← back wall bottom
              ╱                        ╲
   Floor:   (0,100) ────────────── (100,100)

   ═══════════════════════════════════════════════════ */

/* Back-wall cabinet data */
const CABS = [
  { x: 23, label: 'PAC-MAN',    mq: 'from-yellow-700/40 to-yellow-900/40', scr: 'hsl(51 100% 50%/0.25)',  gl: 'hsl(51 100% 50%/0.2)' },
  { x: 34, label: 'TEKKEN',     mq: 'from-red-700/40 to-red-900/40',       scr: 'hsl(0 100% 50%/0.22)',   gl: 'hsl(0 100% 50%/0.18)' },
  { x: 45, label: 'STREET F.II',mq: 'from-blue-700/40 to-blue-900/40',     scr: 'hsl(220 100% 50%/0.25)', gl: 'hsl(220 100% 50%/0.2)' },
  { x: 56, label: 'GALAGA',     mq: 'from-cyan-700/40 to-cyan-900/40',     scr: 'hsl(180 100% 50%/0.22)', gl: 'hsl(180 100% 50%/0.18)' },
  { x: 67, label: 'MORTAL K.',  mq: 'from-emerald-700/40 to-emerald-900/40', scr: 'hsl(120 100% 50%/0.22)', gl: 'hsl(120 100% 50%/0.18)' },
];

/* Side-wall cabinet silhouettes */
const L_SIDES = [
  { top: 38, left: 2,  w: 22, h: 48, o: 0.4 },
  { top: 35, left: 7,  w: 24, h: 55, o: 0.55 },
  { top: 32, left: 13, w: 26, h: 62, o: 0.7 },
];
const R_SIDES = [
  { top: 38, right: 2,  w: 22, h: 48, o: 0.4 },
  { top: 35, right: 7,  w: 24, h: 55, o: 0.55 },
  { top: 32, right: 13, w: 26, h: 62, o: 0.7 },
];

export default function LobbyPage() {
  const navigate = useNavigate();
  const { username } = useApp();

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] relative overflow-hidden bg-black">

        {/* ══════════ CEILING ══════════ */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 80% 20%, 20% 20%)',
            background: 'linear-gradient(180deg, #040408 0%, #080810 100%)',
          }}
        >
          {/* Exposed ductwork */}
          <div className="absolute top-[5%] left-[8%] right-[8%] h-[3px] bg-gradient-to-r from-transparent via-gray-700/30 to-transparent" />
          <div className="absolute top-[9%] left-[12%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-gray-600/25 to-transparent" />
          <div className="absolute top-[3%] left-[25%] w-[15%] h-[3px] bg-gray-700/25" />
          <div className="absolute top-[3%] right-[28%] w-[12%] h-[3px] bg-gray-700/20" />
          {/* Cross pipe */}
          <div className="absolute top-[5%] left-[40%] w-[2px] h-[8%] bg-gray-700/20" />
          <div className="absolute top-[5%] right-[35%] w-[2px] h-[6%] bg-gray-600/15" />

          {/* Hanging lights */}
          {[22, 38, 55, 72].map((x, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="absolute"
              style={{ left: `${x}%`, top: '2%', transform: 'translateX(-50%)' }}
            >
              {/* Wire */}
              <div className="w-px mx-auto bg-gray-600/50" style={{ height: 28 + (i % 2) * 8 }} />
              {/* Fixture */}
              <div
                className="w-8 h-4 mx-auto rounded-b-full"
                style={{
                  background: i % 3 === 0
                    ? 'radial-gradient(ellipse, hsl(40 85% 65%/0.55), hsl(40 70% 40%/0.2) 70%, transparent)'
                    : i % 3 === 1
                    ? 'radial-gradient(ellipse, hsl(180 80% 55%/0.4), hsl(180 80% 40%/0.15) 70%, transparent)'
                    : 'radial-gradient(ellipse, hsl(320 70% 55%/0.35), hsl(320 70% 40%/0.12) 70%, transparent)',
                  boxShadow: i % 3 === 0
                    ? '0 6px 35px 8px hsl(40 85% 50%/0.08), 0 2px 15px hsl(40 85% 60%/0.12)'
                    : i % 3 === 1
                    ? '0 6px 35px 8px hsl(180 80% 50%/0.06), 0 2px 15px hsl(180 80% 50%/0.08)'
                    : '0 6px 30px 6px hsl(320 70% 50%/0.05), 0 2px 12px hsl(320 70% 55%/0.06)',
                }}
              />
            </motion.div>
          ))}
        </div>

        {/* ══════════ LEFT WALL ══════════ */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0% 0%, 20% 20%, 20% 58%, 0% 100%)',
            background: 'linear-gradient(160deg, #0c0c16 0%, #0e0e1c 50%, #0a0a14 100%)',
          }}
        >
          {/* Paneling */}
          <div className="absolute inset-0" style={{
            background: `
              repeating-linear-gradient(100deg, transparent, transparent 7%, rgba(255,255,255,0.008) 7%, rgba(255,255,255,0.008) 7.5%),
              repeating-linear-gradient(0deg, transparent, transparent 30%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.08) 30.5%)
            `,
          }} />

          {/* Side cabinets (seen from profile) */}
          {L_SIDES.map((c, i) => (
            <div key={i} className="absolute" style={{ top: `${c.top}%`, left: `${c.left}%`, opacity: c.o }}>
              <div style={{ width: c.w, height: c.h }} className="relative">
                <div className="absolute inset-0 bg-gray-900/50 border-r border-gray-600/15" />
                <div className="absolute top-[8%] right-0 w-[55%] h-[45%]" style={{
                  background: i === 2 ? 'hsl(180 100% 50%/0.12)' : i === 1 ? 'hsl(320 100% 50%/0.09)' : 'hsl(120 100% 50%/0.07)',
                  boxShadow: `0 0 ${4 + i * 3}px ${i === 2 ? 'hsl(180 100% 50%/0.1)' : 'transparent'}`,
                }} />
              </div>
            </div>
          ))}

          {/* Posters */}
          <div className="absolute top-[24%] left-[3%] w-[28px] h-[36px] border border-gray-500/15 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-700/15 via-red-800/10 to-orange-900/15" />
            <div className="absolute inset-[2px] border border-gray-500/8" />
          </div>
          <div className="absolute top-[42%] left-[8%] w-[22px] h-[28px] border border-gray-500/12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-700/12 to-indigo-900/12" />
          </div>
        </div>

        {/* ══════════ RIGHT WALL ══════════ */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(100% 0%, 80% 20%, 80% 58%, 100% 100%)',
            background: 'linear-gradient(200deg, #0c0c16 0%, #0e0e1c 50%, #0a0a14 100%)',
          }}
        >
          {/* Paneling */}
          <div className="absolute inset-0" style={{
            background: `
              repeating-linear-gradient(80deg, transparent, transparent 7%, rgba(255,255,255,0.008) 7%, rgba(255,255,255,0.008) 7.5%),
              repeating-linear-gradient(0deg, transparent, transparent 30%, rgba(0,0,0,0.08) 30%, rgba(0,0,0,0.08) 30.5%)
            `,
          }} />

          {/* Side cabinets */}
          {R_SIDES.map((c, i) => (
            <div key={i} className="absolute" style={{ top: `${c.top}%`, right: `${c.right}%`, opacity: c.o }}>
              <div style={{ width: c.w, height: c.h }} className="relative">
                <div className="absolute inset-0 bg-gray-900/50 border-l border-gray-600/15" />
                <div className="absolute top-[8%] left-0 w-[55%] h-[45%]" style={{
                  background: i === 2 ? 'hsl(51 100% 50%/0.12)' : i === 1 ? 'hsl(0 100% 50%/0.09)' : 'hsl(280 100% 50%/0.07)',
                  boxShadow: `0 0 ${4 + i * 3}px ${i === 2 ? 'hsl(51 100% 50%/0.1)' : 'transparent'}`,
                }} />
              </div>
            </div>
          ))}

          {/* Posters */}
          <div className="absolute top-[24%] right-[3%] w-[28px] h-[36px] border border-gray-500/15 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-700/15 via-pink-800/10 to-purple-900/15" />
            <div className="absolute inset-[2px] border border-gray-500/8" />
          </div>
          <div className="absolute top-[42%] right-[8%] w-[22px] h-[28px] border border-gray-500/12 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-700/12 to-emerald-900/12" />
          </div>

          {/* PAC-MAN neon sign on right wall */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute top-[28%] right-[4%] font-pixel text-[7px] neon-yellow tracking-widest"
          >
            PAC-MAN
          </motion.div>
        </div>

        {/* ══════════ BACK WALL ══════════ */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(20% 20%, 80% 20%, 80% 58%, 20% 58%)',
            background: 'linear-gradient(180deg, #10101c 0%, #141426 40%, #121220 100%)',
          }}
        >
          {/* Subtle brick texture */}
          <div className="absolute inset-0" style={{
            background: `
              repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(255,255,255,0.006) 18px, rgba(255,255,255,0.006) 19px),
              repeating-linear-gradient(90deg, transparent, transparent 35px, rgba(255,255,255,0.004) 35px, rgba(255,255,255,0.004) 36px)
            `,
          }} />

          {/* ── NEON SIGNS ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="absolute top-[23%] left-[23%] font-pixel text-[15px] neon-cyan tracking-[0.2em] animate-pulse-glow"
            style={{ textShadow: '0 0 8px hsl(180 100% 50%), 0 0 25px hsl(180 100% 50%/0.6), 0 0 50px hsl(180 100% 50%/0.25)' }}
          >
            ARCADE
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute top-[22%] left-[50%] -translate-x-1/2 font-display text-2xl font-bold neon-magenta tracking-[0.2em]"
            style={{ textShadow: '0 0 8px hsl(320 100% 55%), 0 0 30px hsl(320 100% 55%/0.6), 0 0 60px hsl(320 100% 55%/0.2)' }}
          >
            PLAY NOW
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="absolute top-[24%] right-[23%] font-pixel text-[12px] neon-green tracking-[0.15em] animate-pulse-glow"
            style={{ textShadow: '0 0 6px hsl(120 100% 50%), 0 0 20px hsl(120 100% 50%/0.5), 0 0 45px hsl(120 100% 50%/0.2)' }}
          >
            HI-SCORE
          </motion.div>

          {/* ── ARCADE CABINETS ── */}
          {CABS.map((cab, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="absolute"
              style={{ left: `${cab.x}%`, top: '36%' }}
            >
              <div className="w-[58px] relative">
                {/* Marquee */}
                <div className={`h-[15px] bg-gradient-to-b ${cab.mq} border border-gray-500/20 flex items-center justify-center rounded-t-[2px]`}>
                  <span className="font-pixel text-[3px] text-white/70 tracking-wider">{cab.label}</span>
                </div>
                {/* Screen */}
                <div className="bg-[#0a0a0a] px-[3px] py-[3px] border-x border-gray-600/15">
                  <div
                    className="h-[38px] relative overflow-hidden"
                    style={{ background: cab.scr, boxShadow: `0 0 18px ${cab.gl}` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/12 via-transparent to-black/10" />
                    <div className="absolute inset-0" style={{
                      background: 'repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.07) 1px,rgba(0,0,0,0.07) 2px)',
                    }} />
                  </div>
                </div>
                {/* Control panel */}
                <div className="h-[11px] bg-gray-700/30 border-x border-gray-600/15 flex items-center justify-center gap-[3px] px-1">
                  <div className="w-[5px] h-[3px] bg-gray-900/60 rounded-full" />
                  <div className="w-[5px] h-[5px] rounded-full bg-red-500/70" style={{ boxShadow: '0 0 3px rgba(255,0,0,0.3)' }} />
                  <div className="w-[4px] h-[4px] rounded-full bg-blue-400/50" />
                  <div className="w-[4px] h-[4px] rounded-full bg-yellow-400/50" />
                </div>
                {/* Lower body */}
                <div className="h-[28px] bg-gradient-to-b from-gray-800/35 to-gray-900/45 border-x border-gray-600/12">
                  {/* Sticker / art */}
                  <div className="mx-[4px] mt-[5px] h-[8px] bg-gradient-to-r from-gray-700/15 to-gray-600/10 border border-gray-600/10" />
                </div>
                {/* Coin slot */}
                <div className="h-[8px] bg-gray-900/50 border border-gray-600/12 flex items-center justify-center rounded-b-[2px]">
                  <div className="w-[8px] h-[3px] bg-black/50 rounded-full border border-gray-500/15" />
                </div>
              </div>
            </motion.div>
          ))}

          {/* Posters between/above cabinets */}
          <div className="absolute top-[30%] left-[30%] w-[26px] h-[32px] border border-gray-400/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-700/12 to-amber-900/12" />
          </div>
          <div className="absolute top-[31%] right-[28%] w-[24px] h-[28px] border border-gray-400/10 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-sky-700/10 to-sky-900/10" />
          </div>
        </div>

        {/* ══════════ FLOOR ══════════ */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(20% 58%, 80% 58%, 100% 100%, 0% 100%)',
          }}
        >
          {/* 90s retro carpet — colorful confetti on dark */}
          <div className="absolute inset-0" style={{
            background: `
              linear-gradient(60deg,  hsl(0 85% 45%/0.09) 25%, transparent 25.5%) 0 0 / 42px 42px,
              linear-gradient(240deg, hsl(0 85% 45%/0.06) 25%, transparent 25.5%) 21px 0 / 42px 42px,
              linear-gradient(120deg, hsl(280 85% 50%/0.065) 25%, transparent 25.5%) 10px 21px / 42px 42px,
              linear-gradient(300deg, hsl(280 85% 50%/0.05) 25%, transparent 25.5%) 31px 21px / 42px 42px,
              radial-gradient(circle, hsl(180 100% 50%/0.075) 2px, transparent 2.5px) 8px 28px / 34px 34px,
              radial-gradient(circle, hsl(51  100% 50%/0.065) 2px, transparent 2.5px) 25px 10px / 34px 34px,
              radial-gradient(circle, hsl(320 100% 50%/0.055) 1.5px, transparent 2px) 18px 18px / 26px 26px,
              radial-gradient(circle, hsl(120 100% 45%/0.05) 1.5px, transparent 2px) 4px 4px / 26px 26px,
              linear-gradient(45deg,  hsl(51 90% 50%/0.04) 2px, transparent 2.5px) 15px 6px / 22px 22px,
              linear-gradient(-45deg, hsl(180 90% 50%/0.035) 2px, transparent 2.5px) 6px 15px / 22px 22px,
              linear-gradient(to bottom, #09091a 0%, #070715 100%)
            `,
          }} />

          {/* Light pools from ceiling fixtures */}
          {[28, 45, 62].map((x, i) => (
            <div
              key={i}
              className="absolute pointer-events-none"
              style={{
                left: `${x}%`, top: '5%', transform: 'translateX(-50%)',
                width: 130, height: 70,
                background: i === 1
                  ? 'radial-gradient(ellipse, hsl(40 80% 50%/0.04), transparent 70%)'
                  : 'radial-gradient(ellipse, hsl(40 80% 50%/0.025), transparent 70%)',
                filter: 'blur(8px)',
              }}
            />
          ))}

          {/* Neon reflection on floor */}
          <div className="absolute top-0 left-[25%] w-[18%] h-[15%] bg-cyan-500/[0.02] blur-xl pointer-events-none" />
          <div className="absolute top-0 left-[42%] w-[16%] h-[12%] bg-pink-500/[0.025] blur-xl pointer-events-none" />
          <div className="absolute top-0 right-[25%] w-[15%] h-[12%] bg-green-500/[0.018] blur-xl pointer-events-none" />
        </div>

        {/* ══════════ EDGE LINES ══════════ */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* Floor edges */}
          <line x1="0" y1="1000" x2="200" y2="580" stroke="hsl(180 100% 50% / 0.07)" strokeWidth="1" />
          <line x1="1000" y1="1000" x2="800" y2="580" stroke="hsl(180 100% 50% / 0.07)" strokeWidth="1" />
          {/* Back wall bottom */}
          <line x1="200" y1="580" x2="800" y2="580" stroke="hsl(180 100% 50% / 0.09)" strokeWidth="0.8" />
          {/* Ceiling to back wall */}
          <line x1="0" y1="0" x2="200" y2="200" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          <line x1="1000" y1="0" x2="800" y2="200" stroke="rgba(255,255,255,0.025)" strokeWidth="1" />
          {/* Back wall top */}
          <line x1="200" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.035)" strokeWidth="0.8" />
          {/* Verticals */}
          <line x1="200" y1="200" x2="200" y2="580" stroke="rgba(255,255,255,0.02)" strokeWidth="0.8" />
          <line x1="800" y1="200" x2="800" y2="580" stroke="rgba(255,255,255,0.02)" strokeWidth="0.8" />
        </svg>

        {/* ══════════ AMBIENT GLOW ══════════ */}
        <div className="absolute top-[12%] left-[25%] w-36 h-10 bg-cyan-500/[0.025] blur-2xl pointer-events-none" />
        <div className="absolute top-[10%] left-[45%] w-44 h-12 bg-pink-500/[0.03] blur-2xl pointer-events-none" />
        <div className="absolute top-[12%] right-[24%] w-32 h-10 bg-green-500/[0.02] blur-2xl pointer-events-none" />

        {/* Cabinet screen glow on back wall */}
        <div className="absolute top-[48%] left-[28%] w-40 h-8 bg-yellow-500/[0.015] blur-xl pointer-events-none" />
        <div className="absolute top-[48%] left-[48%] w-36 h-8 bg-blue-500/[0.015] blur-xl pointer-events-none" />
        <div className="absolute top-[48%] right-[26%] w-40 h-8 bg-green-500/[0.012] blur-xl pointer-events-none" />

        {/* ══════════ UI OVERLAY ══════════ */}

        {/* Room label */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="absolute top-2 left-1/2 -translate-x-1/2 z-30 font-pixel text-[7px] text-muted-foreground/50 tracking-[0.4em]"
        >
          MAIN HALL
        </motion.div>

        {/* Play button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="absolute bottom-14 left-1/2 -translate-x-1/2 z-30"
        >
          <button
            onClick={() => navigate('/play')}
            className="bg-primary text-black font-pixel text-[10px] tracking-widest px-10 py-3 border-glow-cyan hover:brightness-125 active:scale-95 transition-all"
          >
            ► PLAY {MOCK_GENERATED_GAME.title.toUpperCase()} ◄
          </button>
        </motion.div>

        {/* Bottom info */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black/90 to-transparent z-30 flex items-end justify-between px-6 pb-2 pointer-events-none">
          <span className="font-pixel text-[6px] text-muted-foreground tracking-widest">{username} &bull; CREDITS: 99</span>
          <span className="font-pixel text-[6px] neon-green">8 ONLINE</span>
          <span className="font-pixel text-[6px] text-muted-foreground tracking-widest">FLOOR 1</span>
        </div>
      </div>
    </AppShell>
  );
}
