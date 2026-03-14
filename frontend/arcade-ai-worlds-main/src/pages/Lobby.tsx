import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, MOCK_GENERATED_GAME } from '@/lib/mockData';
import AppShell from '@/components/AppShell';
import { useApp } from '@/lib/AppContext';

/* ── Wandering player logic ──────────────────── */
interface WanderPlayer {
  id: string;
  username: string;
  avatar: string;
  status: string;
  game: string | null;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  facingRight: boolean;
}

function initPlayers(): WanderPlayer[] {
  return MOCK_USERS.map(u => ({
    id: u.id,
    username: u.username,
    avatar: u.avatar,
    status: u.status,
    game: u.game,
    x: u.x,
    y: 30 + u.y * 0.55, // keep in the floor area (30%–85%)
    targetX: 10 + Math.random() * 80,
    targetY: 30 + Math.random() * 55,
    speed: 0.15 + Math.random() * 0.2,
    facingRight: Math.random() > 0.5,
  }));
}

function useWanderingPlayers() {
  const [players, setPlayers] = useState(initPlayers);
  const frameRef = useRef<number>();

  useEffect(() => {
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 16, 3); // normalize to ~60fps
      last = now;

      setPlayers(prev => prev.map(p => {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // arrived → pick new target
        if (dist < 1.5) {
          return {
            ...p,
            targetX: 8 + Math.random() * 84,
            targetY: 32 + Math.random() * 50,
            speed: 0.1 + Math.random() * 0.2,
          };
        }

        const move = p.speed * dt;
        const nx = p.x + (dx / dist) * move;
        const ny = p.y + (dy / dist) * move;

        return {
          ...p,
          x: nx,
          y: ny,
          facingRight: dx > 0,
        };
      }));

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, []);

  return players;
}

/* ── Room decorations (static) ───────────────── */
const CABINETS = [
  { x: 5, y: 22, w: 38, h: 52, screen: 'cyan' },
  { x: 20, y: 22, w: 38, h: 52, screen: 'magenta' },
  { x: 78, y: 22, w: 38, h: 52, screen: 'green' },
  { x: 93, y: 22, w: 38, h: 52, screen: 'yellow' },
  { x: 38, y: 18, w: 34, h: 44, screen: 'cyan' },
  { x: 60, y: 18, w: 34, h: 44, screen: 'magenta' },
];

const SIGNS = [
  { text: 'ARCADE', x: 12, y: 5, color: 'neon-cyan', size: 'text-[11px]' },
  { text: 'PLAY NOW', x: 48, y: 3, color: 'neon-magenta', size: 'text-[13px]' },
  { text: 'HIGH SCORES', x: 82, y: 6, color: 'neon-green', size: 'text-[9px]' },
];

/* ── Lobby Page ───────────────────────────────── */
export default function LobbyPage() {
  const navigate = useNavigate();
  const { username } = useApp();
  const players = useWanderingPlayers();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] relative overflow-hidden bg-black select-none">

        {/* ═══ ROOM BACKGROUND ═══ */}

        {/* Back wall */}
        <div className="absolute top-0 inset-x-0 h-[30%] bg-gradient-to-b from-[#08080e] to-[#0a0a12]">
          {/* Wall paneling */}
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(90deg, transparent, transparent 120px, rgba(255,255,255,0.015) 120px, rgba(255,255,255,0.015) 121px)',
          }} />
        </div>

        {/* Floor */}
        <div className="absolute bottom-0 inset-x-0 h-[72%]">
          {/* Retro carpet */}
          <div className="absolute inset-0" style={{
            background: `
              radial-gradient(circle, hsl(320 100% 50%/0.04) 1.5px, transparent 2px) 0 0 / 24px 24px,
              radial-gradient(circle, hsl(180 100% 50%/0.035) 1.5px, transparent 2px) 12px 12px / 24px 24px,
              radial-gradient(circle, hsl(51 100% 50%/0.025) 1px, transparent 1.5px) 6px 18px / 24px 24px,
              linear-gradient(to bottom, #09090f, #060610)
            `,
          }} />
          {/* Floor line (wall meets floor) */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-gray-700/40 to-transparent" />
        </div>

        {/* Side shadows */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-black/60 to-transparent z-30 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-black/60 to-transparent z-30 pointer-events-none" />

        {/* ═══ NEON WALL SIGNS ═══ */}
        {SIGNS.map(s => (
          <motion.div
            key={s.text}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className={`absolute font-pixel ${s.size} ${s.color} tracking-widest z-10 pointer-events-none`}
            style={{
              left: `${s.x}%`, top: `${s.y}%`,
              transform: 'translateX(-50%)',
            }}
          >
            {s.text}
          </motion.div>
        ))}

        {/* ═══ ARCADE CABINETS (decoration) ═══ */}
        {CABINETS.map((c, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="absolute z-[5] pointer-events-none"
            style={{ left: `${c.x}%`, top: `${c.y}%` }}
          >
            {/* Cabinet body */}
            <div style={{ width: c.w, height: c.h }} className="relative">
              {/* Screen */}
              <div
                className={`absolute top-0 inset-x-0 h-[55%] ${
                  c.screen === 'cyan' ? 'bg-cyan-500/20' :
                  c.screen === 'magenta' ? 'bg-pink-500/20' :
                  c.screen === 'green' ? 'bg-green-500/20' :
                  'bg-yellow-500/20'
                } border border-gray-700/30`}
                style={{
                  boxShadow: `0 0 12px ${
                    c.screen === 'cyan' ? 'hsl(180 100% 50%/0.2)' :
                    c.screen === 'magenta' ? 'hsl(320 100% 55%/0.2)' :
                    c.screen === 'green' ? 'hsl(120 100% 50%/0.2)' :
                    'hsl(51 100% 52%/0.2)'
                  }`,
                }}
              >
                <div className="absolute inset-0" style={{
                  background: 'repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.1) 1px,rgba(0,0,0,0.1) 2px)',
                }} />
              </div>
              {/* Body */}
              <div className="absolute bottom-0 inset-x-0 h-[45%] bg-gray-900/40 border border-gray-700/20" />
            </div>
          </motion.div>
        ))}

        {/* ═══ WANDERING PLAYERS ═══ */}
        {players.map((p, i) => {
          const isHovered = hovered === p.id;
          // z-index based on Y position (further down = in front)
          const zIdx = Math.round(p.y);

          return (
            <div
              key={p.id}
              className="absolute cursor-pointer"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                transform: `translateX(-50%) scaleX(${p.facingRight ? 1 : -1})`,
                zIndex: 10 + zIdx,
                transition: 'left 0.3s linear, top 0.3s linear',
              }}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* The character */}
              <div
                className="flex flex-col items-center"
                style={{ transform: `scaleX(${p.facingRight ? 1 : -1})` }} // un-flip the content
              >
                {/* Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50"
                  >
                    <div className="bg-black/95 border border-primary px-3 py-2 whitespace-nowrap border-glow-cyan">
                      <div className="font-pixel text-[7px] neon-cyan mb-1">{p.username}</div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          p.status === 'Playing' || p.status === 'In Match'
                            ? 'bg-neon-green' : 'bg-yellow-500'
                        }`} />
                        <span className="font-terminal text-sm text-muted-foreground">
                          {p.status === 'Playing' || p.status === 'In Match' ? 'Online' : 'Idle'}
                        </span>
                      </div>
                      {p.game && (
                        <div className="font-terminal text-sm text-neon-yellow">
                          Playing: {p.game}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Avatar emoji */}
                <div className={`text-3xl transition-transform duration-200 ${
                  isHovered ? 'scale-125' : ''
                }`}>
                  {p.avatar}
                </div>

                {/* Shadow on floor */}
                <div className="w-6 h-1.5 bg-white/[0.04] rounded-full mt-[-2px]" />
              </div>
            </div>
          );
        })}

        {/* ═══ YOUR PLAYER (center-ish) ═══ */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          className="absolute z-40"
          style={{ left: '50%', top: '60%', transform: 'translateX(-50%)' }}
        >
          <div className="flex flex-col items-center">
            <div className="font-pixel text-[6px] neon-cyan mb-1 tracking-widest">{username}</div>
            <div className="text-4xl animate-float">🎮</div>
            <div className="w-8 h-2 bg-white/[0.05] rounded-full mt-[-2px]" />
          </div>
        </motion.div>

        {/* ═══ PLAY BUTTON ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-40"
        >
          <button
            onClick={() => navigate('/play')}
            className="bg-primary text-black font-pixel text-[10px] tracking-widest px-8 py-3 border-glow-cyan hover:brightness-125 active:scale-95 transition-all"
          >
            ► PLAY {MOCK_GENERATED_GAME.title.toUpperCase()} ◄
          </button>
        </motion.div>

        {/* ═══ BOTTOM INFO ═══ */}
        <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-black to-transparent z-30 flex items-end justify-between px-6 pb-2 pointer-events-none">
          <span className="font-pixel text-[6px] text-muted-foreground">{username} &bull; CREDITS: 99</span>
          <span className="font-pixel text-[6px] neon-green">{MOCK_USERS.length + 1} ONLINE</span>
          <span className="font-pixel text-[6px] text-muted-foreground">MAIN HALL</span>
        </div>
      </div>
    </AppShell>
  );
}
