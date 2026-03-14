import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_FRIENDS, MOCK_PENDING_INVITES, MOCK_SUGGESTED } from '@/lib/mockData';
import AppShell from '@/components/AppShell';

export default function FriendsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [tab, setTab] = useState<'friends' | 'pending' | 'suggested'>('friends');

  const filteredFriends = MOCK_FRIENDS.filter(f =>
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] grid-floor scanlines overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 md:p-6">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="font-display text-xl tracking-wider text-foreground mb-1 neon-cyan">FRIENDS</h2>
            <p className="text-sm text-muted-foreground font-body mb-6">Your arcade squad</p>
          </motion.div>

          {/* Search */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search players or add by username..."
              className="w-full bg-input border border-border rounded px-4 py-2.5 text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors"
            />
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6">
            {(['friends', 'pending', 'suggested'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`font-display text-[10px] tracking-wider px-4 py-2 rounded transition-colors ${
                  tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground border border-border'
                }`}
              >
                {t.toUpperCase()}
                {t === 'pending' && MOCK_PENDING_INVITES.length > 0 && (
                  <span className="ml-1.5 bg-neon-magenta text-foreground text-[9px] px-1.5 py-0.5 rounded-full">{MOCK_PENDING_INVITES.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Friends list */}
          {tab === 'friends' && (
            <div className="space-y-3">
              {filteredFriends.map((friend, i) => (
                <motion.div
                  key={friend.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card border border-border rounded p-4 flex items-center gap-4 hover:border-primary/30 transition-colors group"
                >
                  <div className="relative">
                    <div className="text-3xl">{friend.avatar}</div>
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${friend.online ? 'bg-neon-green' : 'bg-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display text-sm tracking-wider text-foreground">{friend.username}</p>
                    <p className="text-xs text-muted-foreground font-body truncate">{friend.status}</p>
                    <div className="flex gap-1.5 mt-1">
                      <span className="text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full border border-border text-muted-foreground">{friend.genre}</span>
                      <span className="text-[9px] font-display tracking-wider px-2 py-0.5 rounded-full border border-neon-magenta/30 text-neon-magenta">{friend.vibe}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="font-display text-[9px] tracking-wider px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-colors">INVITE</button>
                    <button className="font-display text-[9px] tracking-wider px-3 py-1.5 rounded border border-border text-muted-foreground hover:text-foreground transition-colors">PROFILE</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Pending */}
          {tab === 'pending' && (
            <div className="space-y-3">
              {MOCK_PENDING_INVITES.map((invite, i) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card border border-neon-magenta/20 rounded p-4 flex items-center gap-4"
                >
                  <div className="text-3xl">{invite.avatar}</div>
                  <div className="flex-1">
                    <p className="font-display text-sm tracking-wider text-foreground">{invite.username}</p>
                    <p className="text-xs text-muted-foreground font-body">{invite.genre} · {invite.vibe}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="bg-neon-green text-background font-display text-[9px] tracking-wider px-3 py-1.5 rounded">ACCEPT</button>
                    <button className="font-display text-[9px] tracking-wider px-3 py-1.5 rounded border border-border text-muted-foreground">DECLINE</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Suggested */}
          {tab === 'suggested' && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground font-body mb-2">Players with similar taste</p>
              {MOCK_SUGGESTED.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card border border-border rounded p-4 flex items-center gap-4"
                >
                  <div className="text-3xl">{s.avatar}</div>
                  <div className="flex-1">
                    <p className="font-display text-sm tracking-wider text-foreground">{s.username}</p>
                    <p className="text-xs text-muted-foreground font-body">{s.genre} · {s.vibe}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-display tracking-wider text-neon-green">{s.similarity}% match</span>
                    <button className="font-display text-[9px] tracking-wider px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-colors">ADD</button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
