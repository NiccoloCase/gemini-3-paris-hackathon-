import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/AppContext';

const NAV_ITEMS = [
  { path: '/lobby', label: 'LOBBY' },
  { path: '/play',  label: 'PLAY'  },
  { path: '/friends', label: 'SQUAD' },
  { path: '/profile', label: 'PROFILE' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { username } = useApp();

  return (
    <div className="min-h-screen bg-black flex flex-col crt-flicker">
      <div className="scanline-bar" />

      {/* Header */}
      <header className="border-b-2 border-primary bg-black px-4 py-2 flex items-center justify-between sticky top-0 z-40 border-glow-cyan">
        {/* Logo */}
        <div className="font-display font-black tracking-widest text-lg">
          <span className="neon-cyan">ARC</span>
          <span className="neon-magenta">A</span>
          <span className="neon-cyan">DIA</span>
        </div>

        {/* Nav */}
        <nav className="flex items-center gap-0">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink key={item.path} to={item.path}>
                <div className={`relative px-4 py-2 font-pixel text-[8px] tracking-widest transition-colors ${
                  isActive ? 'text-black bg-primary' : 'text-muted-foreground hover:text-primary'
                }`}>
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary -z-10"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Right info */}
        <div className="flex items-center gap-4 font-pixel text-[7px]">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse-glow" />
            <span className="neon-green">8 ONLINE</span>
          </div>
          <span className="text-muted-foreground hidden sm:block">{username}</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden pixel-grid">
        {children}
      </main>
    </div>
  );
}
