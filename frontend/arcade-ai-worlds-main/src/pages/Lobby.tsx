import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_USERS, MOCK_ACTIVITY_FEED, MOCK_GENERATED_GAME, STATUS_COLORS, type UserStatus } from '@/lib/mockData';
import AppShell from '@/components/AppShell';

function LobbyAvatar({ user, delay }: { user: typeof MOCK_USERS[0]; delay: number }) {
  const statusColor = STATUS_COLORS[user.status as UserStatus];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 20 }}
      className="absolute group cursor-pointer"
      style={{ left: `${user.x}%`, top: `${user.y}%` }}
    >
      <div className="animate-float" style={{ animationDelay: `${delay * 1000}ms` }}>
        <div className="relative">
          <div className="text-3xl md:text-4xl">{user.avatar}</div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColor} rounded-full border-2 border-background`} />
        </div>
        {/* Tooltip */}
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="bg-card border border-border rounded px-3 py-2 whitespace-nowrap text-center">
            <p className="font-display text-[10px] tracking-wider text-foreground">{user.username}</p>
            <p className="text-[10px] text-muted-foreground font-body">{user.status}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function LobbyPage() {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] grid-floor scanlines flex">
        {/* Main lobby area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Ambient lights */}
          <div className="absolute top-20 left-20 w-64 h-64 bg-neon-cyan/5 rounded-full blur-[100px]" />
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-neon-magenta/5 rounded-full blur-[100px]" />

          {/* Avatars */}
          <div className="relative w-full h-full">
            {MOCK_USERS.map((user, i) => (
              <LobbyAvatar key={user.id} user={user} delay={0.2 + i * 0.1} />
            ))}

            {/* Player avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="animate-float relative">
                <div className="text-5xl">🎮</div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neon-green rounded-full border-2 border-background" />
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <span className="font-display text-[10px] tracking-wider text-neon-cyan neon-cyan whitespace-nowrap">YOU</span>
                </div>
              </div>
            </motion.div>

            {/* Arcade machines scattered */}
            {[
              { emoji: '🕹️', x: 10, y: 15, label: 'Classic Zone' },
              { emoji: '💻', x: 85, y: 15, label: 'AI Lab' },
              { emoji: '🎰', x: 10, y: 75, label: 'Random Play' },
              { emoji: '⚔️', x: 85, y: 75, label: 'PvP Arena' },
            ].map((machine, i) => (
              <motion.div
                key={machine.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 + i * 0.15 }}
                className="absolute cursor-pointer group"
                style={{ left: `${machine.x}%`, top: `${machine.y}%` }}
              >
                <div className="text-3xl opacity-60 group-hover:opacity-100 transition-opacity">{machine.emoji}</div>
                <p className="font-display text-[8px] tracking-wider text-muted-foreground text-center mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {machine.label}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Featured game card (floating) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-4 left-4 bg-card/90 backdrop-blur-xl border border-border rounded p-4 max-w-xs border-glow-cyan cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/play')}
          >
            <p className="text-[10px] font-display tracking-wider text-primary mb-1">YOUR GENERATED GAME</p>
            <h3 className="font-display text-sm tracking-wider text-foreground mb-1">{MOCK_GENERATED_GAME.title}</h3>
            <p className="text-xs text-muted-foreground font-body">Inspired by {MOCK_GENERATED_GAME.inspiration} · {MOCK_GENERATED_GAME.theme}</p>
            <button className="mt-3 bg-primary text-primary-foreground font-display text-[10px] tracking-wider px-4 py-1.5 rounded hover:brightness-110 transition-all">
              PLAY NOW
            </button>
          </motion.div>
        </div>

        {/* Right sidebar - Activity feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="w-72 border-l border-border bg-card/50 backdrop-blur-xl p-4 overflow-y-auto hidden lg:block"
        >
          <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-4">LIVE ACTIVITY</h3>
          <div className="space-y-3">
            {MOCK_ACTIVITY_FEED.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + i * 0.1 }}
                className="flex gap-3 items-start"
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-body text-foreground leading-tight">{item.text}</p>
                  <p className="text-[10px] text-muted-foreground font-body mt-0.5">{item.time}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="font-display text-xs tracking-wider text-muted-foreground mb-3">QUICK ACTIONS</h3>
            <div className="space-y-2">
              <button onClick={() => navigate('/play')} className="w-full text-left text-xs font-body px-3 py-2 rounded border border-border hover:border-primary hover:text-primary transition-colors">🕹️ Launch Game</button>
              <button onClick={() => navigate('/friends')} className="w-full text-left text-xs font-body px-3 py-2 rounded border border-border hover:border-neon-magenta hover:text-neon-magenta transition-colors">👥 Invite Friend</button>
              <button onClick={() => navigate('/profile')} className="w-full text-left text-xs font-body px-3 py-2 rounded border border-border hover:border-neon-green hover:text-neon-green transition-colors">👤 View Profile</button>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border">
            <div className="bg-neon-magenta/10 border border-neon-magenta/30 rounded p-3 text-center">
              <p className="font-display text-[10px] tracking-wider text-neon-magenta mb-1">COMING SOON</p>
              <p className="text-xs font-body text-foreground">Co-op Mode 🤝</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AppShell>
  );
}
