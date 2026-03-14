import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AppShell from '@/components/AppShell';
import { useApp } from '@/lib/AppContext';

export default function ProfilePage() {
  const { username, logout } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-6 px-4"
        >
          {/* Avatar */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{
              background: 'radial-gradient(circle at 40% 35%, #1e1e30, #0a0a16)',
              border: '2px solid rgba(0,229,255,0.15)',
              boxShadow: '0 0 20px rgba(0,229,255,0.1)',
            }}
          >
            🎮
          </div>

          {/* Username */}
          <h2 className="font-display text-2xl tracking-wider text-foreground">{username}</h2>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="font-pixel text-[8px] tracking-widest px-6 py-2 border border-white/10 text-white/30 hover:text-red-400 hover:border-red-400/40 transition-colors"
          >
            LOGOUT
          </button>
        </motion.div>
      </div>
    </AppShell>
  );
}
