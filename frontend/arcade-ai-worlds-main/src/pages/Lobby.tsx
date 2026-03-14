import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, MOCK_GENERATED_GAME } from '@/lib/mockData';
import AppShell from '@/components/AppShell';
import { useApp } from '@/lib/AppContext';

/* ── screen glow colors ─────────────────────────── */
const SCREEN = {
  cyan:    'bg-cyan-400/50    shadow-[0_0_20px_hsl(180,100%,50%,0.35)]',
  magenta: 'bg-pink-400/50    shadow-[0_0_20px_hsl(320,100%,55%,0.35)]',
  green:   'bg-green-400/50   shadow-[0_0_20px_hsl(120,100%,50%,0.35)]',
  yellow:  'bg-yellow-400/50  shadow-[0_0_20px_hsl(51,100%,52%,0.35)]',
} as const;

type ScreenColor = keyof typeof SCREEN;

const BODY_COLORS = [
  'bg-cyan-900', 'bg-pink-900', 'bg-emerald-900', 'bg-violet-900',
  'bg-amber-900', 'bg-sky-900', 'bg-rose-900', 'bg-teal-900',
];

/* ── cabinet data ────────────────────────────────── */
interface Cab {
  id: string; game: string; screen: ScreenColor;
  player: typeof MOCK_USERS[0] | null; isYours?: boolean;
}

const CABINETS: Cab[] = [
  { id: '1', game: 'PIXEL TEMPLE',   screen: 'cyan',    player: MOCK_USERS[0] },
  { id: '2', game: 'SHADOW MAZE',    screen: 'magenta', player: MOCK_USERS[1] },
  { id: '3', game: 'NEON DASH',      screen: 'green',   player: MOCK_USERS[2] },
  { id: 'you', game: MOCK_GENERATED_GAME.title.toUpperCase(), screen: 'cyan', player: null, isYours: true },
  { id: '4', game: 'VOID BREAKER',   screen: 'magenta', player: MOCK_USERS[5] },
  { id: '5', game: 'RETRO RIVALS',   screen: 'yellow',  player: MOCK_USERS[6] },
  { id: '6', game: 'STAR SERPENT',    screen: 'cyan',    player: MOCK_USERS[4] },
  { id: '7', game: 'CALM CIRCUIT',   screen: 'green',   player: MOCK_USERS[7] },
];

/* ── Mii-style figure ────────────────────────────── */
function MiiFigure({ avatar, name, idx, playing }: {
  avatar: string; name: string; idx: number; playing: boolean;
}) {
  const body = BODY_COLORS[idx % BODY_COLORS.length];
  return (
    <div className={`flex flex-col items-center ${playing ? 'animate-play' : ''}`}>
      <div className="text-2xl mb-[-3px] relative z-10">{avatar}</div>
      <div className={`w-5 h-7 ${body} rounded-t-lg rounded-b-sm`} />
      <div className="flex gap-[2px] mt-[-1px]">
        <div className={`w-[7px] h-3 ${body} rounded-b-sm`} />
        <div className={`w-[7px] h-3 ${body} rounded-b-sm`} />
      </div>
      <span className="font-pixel text-[5px] text-muted-foreground mt-1.5 whitespace-nowrap max-w-[72px] overflow-hidden">
        {name}
      </span>
    </div>
  );
}

/* ── Arcade cabinet ──────────────────────────────── */
function Cabinet({ cab, idx, onPlay }: { cab: Cab; idx: number; onPlay?: () => void }) {
  const playing = cab.player?.status === 'Playing' || cab.player?.status === 'In Match';
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12 + idx * 0.06, type: 'spring', stiffness: 200, damping: 22 }}
      className="flex flex-col items-center shrink-0"
    >
      {/* "YOUR GAME" label */}
      {cab.isYours && (
        <div className="mb-2 h-4">
          <span className="font-pixel text-[6px] neon-cyan animate-blink tracking-widest">▼ YOUR GAME ▼</span>
        </div>
      )}
      {!cab.isYours && <div className="mb-2 h-4" />}

      {/* Machine body */}
      <div
        className={`relative w-[84px] group ${cab.isYours ? 'cursor-pointer' : ''}`}
        onClick={cab.isYours ? onPlay : undefined}
      >
        {/* Marquee */}
        <div className={`h-5 flex items-center justify-center ${
          cab.isYours
            ? 'bg-primary/15 border border-primary/60'
            : 'bg-[#151515] border border-[#2a2a2a]'
        }`}>
          <span className={`font-pixel text-[4px] leading-none tracking-wider ${
            cab.isYours ? 'neon-cyan' : 'text-muted-foreground'
          }`}>
            {cab.game}
          </span>
        </div>

        {/* Screen */}
        <div className={`mx-[5px] my-[5px] h-14 ${SCREEN[cab.screen]} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-br from-white/15 via-transparent to-transparent" />
          <div className="absolute inset-0" style={{
            background: 'repeating-linear-gradient(0deg,transparent,transparent 1px,rgba(0,0,0,0.08) 1px,rgba(0,0,0,0.08) 2px)',
          }} />
        </div>

        {/* Controls */}
        <div className="bg-[#111] px-2 py-1.5 flex items-center justify-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-400/40" />
          <div className="w-5 h-[3px] bg-[#2a2a2a] rounded-full" />
        </div>

        {/* Lower body */}
        <div className="h-12 bg-[#0c0c0c] border-x border-[#1e1e1e]" />

        {/* Base */}
        <div className="h-3 bg-[#101010] border border-[#1e1e1e] border-t-[#2a2a2a]" />

        {/* Highlight pulse for your cabinet */}
        {cab.isYours && (
          <div className="absolute -inset-1 border border-primary/30 pointer-events-none animate-pulse-glow" />
        )}
      </div>

      {/* Player figure or empty slot */}
      <div className="mt-3 h-[72px] flex items-start justify-center">
        {cab.player ? (
          <MiiFigure
            avatar={cab.player.avatar}
            name={cab.player.username}
            idx={idx}
            playing={!!playing}
          />
        ) : cab.isYours ? (
          <div className="font-pixel text-[6px] neon-yellow animate-pulse-glow tracking-widest mt-2">
            PRESS TO PLAY
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ── Lobby page ──────────────────────────────────── */
export default function LobbyPage() {
  const navigate = useNavigate();
  const { username } = useApp();
  const playersActive = MOCK_USERS.filter(u => u.status === 'Playing' || u.status === 'In Match').length + 1;

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] flex flex-col relative overflow-hidden bg-black">

        {/* ── Ceiling: neon tube lights ── */}
        <div className="relative h-7 bg-[#050505] border-b border-[#1a1a1a] flex items-center justify-center gap-10 overflow-hidden shrink-0">
          <div className="w-36 h-[2px] bg-cyan-400/35" style={{ boxShadow: '0 0 10px hsl(180 100% 50% / 0.3), 0 2px 20px hsl(180 100% 50% / 0.12)' }} />
          <div className="w-24 h-[2px] bg-pink-400/25" style={{ boxShadow: '0 0 10px hsl(320 100% 55% / 0.25), 0 2px 20px hsl(320 100% 55% / 0.1)' }} />
          <div className="w-36 h-[2px] bg-cyan-400/35" style={{ boxShadow: '0 0 10px hsl(180 100% 50% / 0.3), 0 2px 20px hsl(180 100% 50% / 0.12)' }} />
          <div className="w-20 h-[2px] bg-green-400/20" style={{ boxShadow: '0 0 10px hsl(120 100% 50% / 0.2)' }} />
          <div className="w-36 h-[2px] bg-cyan-400/35" style={{ boxShadow: '0 0 10px hsl(180 100% 50% / 0.3)' }} />
        </div>

        {/* ── Room header ── */}
        <div className="text-center py-3 shrink-0">
          <div className="font-pixel text-[7px] text-muted-foreground tracking-[0.35em]">
            ─── MAIN HALL ───
          </div>
          <div className="font-pixel text-[7px] neon-green mt-1">
            {playersActive} PLAYERS ACTIVE
          </div>
        </div>

        {/* ── Cabinets row ── */}
        <div className="flex-1 flex items-center overflow-hidden">
          <div className="flex gap-5 overflow-x-auto w-full px-8 py-2 items-end scrollbar-hide">
            {CABINETS.map((cab, i) => (
              <Cabinet key={cab.id} cab={cab} idx={i} onPlay={() => navigate('/play')} />
            ))}
          </div>
        </div>

        {/* ── Floor ── */}
        <div className="h-[72px] relative overflow-hidden shrink-0">
          {/* Checkerboard */}
          <div className="absolute inset-0" style={{
            background: 'repeating-conic-gradient(#0e0e0e 0% 25%, #090909 0% 50%) 0 0 / 28px 28px',
          }} />
          {/* Neon reflection */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.03] to-transparent" />

          <div className="relative z-10 h-full flex items-center justify-between px-6">
            <div className="font-pixel text-[6px] text-muted-foreground tracking-widest">
              {username} &bull; CREDITS: 99
            </div>
            <button
              onClick={() => navigate('/play')}
              className="font-pixel text-[8px] neon-cyan animate-pulse-glow tracking-widest hover:brightness-150 transition-all"
            >
              ► PLAY YOUR GAME ◄
            </button>
            <div className="font-pixel text-[6px] text-muted-foreground tracking-widest">
              FLOOR 1
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
