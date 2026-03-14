import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const NAV_ITEMS = [
  { path: '/lobby', label: 'Lobby', icon: '🏛️' },
  { path: '/play', label: 'Play', icon: '🕹️' },
  { path: '/friends', label: 'Friends', icon: '👥' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top nav */}
      <header className="border-b border-border bg-card/80 backdrop-blur-xl px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-lg font-bold tracking-wider">
            <span className="text-foreground">ARC</span>
            <span className="text-neon-magenta">A</span>
            <span className="text-foreground">DIA</span>
          </h1>
        </div>

        <nav className="flex items-center gap-1">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative"
              >
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-body transition-colors ${
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}>
                  <span>{item.icon}</span>
                  <span className="hidden sm:inline font-display text-xs tracking-wider">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div
                    layoutId="navIndicator"
                    className="absolute bottom-0 left-1 right-1 h-0.5 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-neon-green font-body">
            <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" />
            <span>8 online</span>
          </div>
          <span className="text-xl">🎮</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
