import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_PROFILE } from '@/lib/mockData';
import AppShell from '@/components/AppShell';
import { useApp } from '@/lib/AppContext';

export default function ProfilePage() {
  const p = MOCK_PROFILE;
  const { logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] grid-floor scanlines overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          {/* Profile header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded p-6 mb-6 flex items-start gap-6"
          >
            <div className="text-6xl">{p.avatar}</div>
            <div className="flex-1">
              <h2 className="font-display text-xl tracking-wider text-foreground mb-1">{p.username}</h2>
              <p className="text-sm text-muted-foreground font-body mb-3">{p.bio}</p>
              <div className="flex flex-wrap gap-2">
                {p.genres.map(g => (
                  <span key={g} className="text-[10px] font-display tracking-wider px-2.5 py-1 rounded-full border border-primary/50 text-primary">{g}</span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button className="font-display text-[10px] tracking-wider px-4 py-2 rounded border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                EDIT PROFILE
              </button>
              <button
                onClick={handleLogout}
                className="font-display text-[10px] tracking-wider px-4 py-2 rounded border border-red-500/40 text-red-400 hover:border-red-500 hover:text-red-300 transition-colors"
              >
                LOGOUT
              </button>
            </div>
          </motion.div>

          {/* AI Taste Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-neon-magenta/20 rounded p-5 mb-6 border-glow-magenta"
          >
            <h3 className="font-display text-xs tracking-wider text-neon-magenta mb-3">YOUR AI TASTE PROFILE</h3>
            <div className="flex flex-wrap gap-2">
              {p.vibes.map(v => (
                <span key={v} className="text-xs font-display tracking-wider px-3 py-1.5 rounded-full border border-neon-magenta/30 text-neon-magenta bg-neon-magenta/10">{v}</span>
              ))}
              <span className="text-xs font-display tracking-wider px-3 py-1.5 rounded-full border border-primary/30 text-primary bg-primary/10">Arcade classic lover</span>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded p-5"
            >
              <h3 className="font-display text-xs tracking-wider text-primary mb-4">ARCADE STATS</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Games Generated', value: p.stats.gamesGenerated, color: 'text-primary' },
                  { label: 'High Score', value: p.stats.highScore.toLocaleString(), color: 'text-neon-green' },
                  { label: 'Friends Added', value: p.stats.friendsAdded, color: 'text-neon-magenta' },
                  { label: 'Time Played', value: p.stats.timePlayed, color: 'text-foreground' },
                  { label: 'Fav Mechanic', value: p.stats.favoriteMechanic, color: 'text-foreground' },
                  { label: 'Current Vibe', value: p.stats.currentVibe, color: 'text-neon-magenta' },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-[10px] font-display tracking-wider text-muted-foreground mb-0.5">{stat.label}</p>
                    <p className={`text-sm font-display tracking-wider ${stat.color}`}>{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-card border border-border rounded p-5"
            >
              <h3 className="font-display text-xs tracking-wider text-neon-green mb-4">ACHIEVEMENTS</h3>
              <div className="space-y-3">
                {p.achievements.map(a => (
                  <div key={a.name} className="flex items-center gap-3">
                    <span className="text-xl">{a.icon}</span>
                    <div>
                      <p className="font-display text-xs tracking-wider text-foreground">{a.name}</p>
                      <p className="text-[10px] text-muted-foreground font-body">{a.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Game History */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded p-5"
          >
            <h3 className="font-display text-xs tracking-wider text-primary mb-4">GENERATED GAME HISTORY</h3>
            <div className="space-y-3">
              {p.gameHistory.map((game, i) => (
                <div key={game.title} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-sm text-muted-foreground">#{i + 1}</span>
                    <div>
                      <p className="font-display text-sm tracking-wider text-foreground">{game.title}</p>
                      <p className="text-[10px] text-muted-foreground font-body">{game.theme}</p>
                    </div>
                  </div>
                  <span className="font-display text-sm tracking-wider text-neon-green">{game.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
