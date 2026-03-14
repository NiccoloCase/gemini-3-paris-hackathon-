import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/lib/AppContext';
import { useNavigate } from 'react-router-dom';

export default function WelcomePage() {
  const { setLoggedIn, setUsername, setOnboarded } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setUsername(name || 'Player_One');
    setLoggedIn(true);
    navigate('/onboarding');
  };

  const handleGuest = () => {
    setUsername('Guest_' + Math.floor(Math.random() * 9999));
    setLoggedIn(true);
    navigate('/onboarding');
  };

  const features = [
    { icon: '🕹️', title: 'Social Lobby', desc: 'Hang out with other players in a live virtual arcade.' },
    { icon: '🤖', title: 'AI Preference Chat', desc: 'Tell our AI your vibe and watch it craft your game.' },
    { icon: '🎮', title: 'Personalized Game', desc: 'A unique arcade game generated just for you.' },
  ];

  return (
    <div className="min-h-screen bg-background grid-floor scanlines flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-magenta/5 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h1 className="font-display text-5xl md:text-6xl font-black tracking-wider mb-2">
              <span className="text-foreground">ARC</span>
              <span className="text-neon-magenta neon-magenta">A</span>
              <span className="text-foreground">DIA</span>
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground font-body text-sm tracking-wide"
          >
            AI-generated arcade worlds, co-created with your vibe.
          </motion.p>
        </div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card/80 backdrop-blur-xl border border-border rounded p-6 mb-6 border-glow-cyan"
        >
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-display text-muted-foreground mb-1.5 tracking-wider uppercase">Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="NeonKnight"
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-display text-muted-foreground mb-1.5 tracking-wider uppercase">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="player@arcadia.gg"
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-display text-muted-foreground mb-1.5 tracking-wider uppercase">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-input border border-border rounded px-3 py-2.5 text-foreground font-body text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/30 transition-colors"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground font-display text-sm font-bold tracking-wider py-3 rounded border-glow-cyan hover:brightness-110 transition-all"
            >
              ENTER ARCADIA
            </button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground font-body">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            onClick={handleGuest}
            className="w-full border border-border text-muted-foreground font-display text-xs tracking-wider py-2.5 rounded hover:border-neon-magenta hover:text-neon-magenta transition-colors"
          >
            CONTINUE AS GUEST
          </button>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="grid grid-cols-3 gap-3"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="bg-card/50 border border-border rounded p-3 text-center hover:border-neon-cyan/50 transition-colors"
            >
              <div className="text-2xl mb-2">{f.icon}</div>
              <h3 className="font-display text-[10px] tracking-wider text-foreground mb-1">{f.title}</h3>
              <p className="text-[10px] text-muted-foreground font-body leading-tight">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
