import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MOCK_GENERATED_GAME } from '@/lib/mockData';
import AppShell from '@/components/AppShell';

// Simple maze game
const GRID_SIZE = 15;
const CELL_SIZE = 28;

type Position = { x: number; y: number };

function generateMaze(): number[][] {
  const maze: number[][] = Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
  // Add walls
  const walls = [
    [1,1],[1,2],[1,5],[1,6],[1,8],[1,9],[1,11],[1,12],
    [2,3],[2,5],[2,9],[2,12],
    [3,1],[3,3],[3,5],[3,7],[3,9],[3,11],[3,13],
    [4,7],[4,11],
    [5,1],[5,2],[5,3],[5,5],[5,7],[5,9],[5,10],[5,11],[5,13],
    [6,5],[6,13],
    [7,1],[7,2],[7,3],[7,5],[7,7],[7,8],[7,9],[7,11],[7,13],
    [8,1],[8,9],[8,11],
    [9,1],[9,3],[9,5],[9,6],[9,7],[9,9],[9,11],[9,13],
    [10,3],[10,13],
    [11,1],[11,3],[11,5],[11,7],[11,8],[11,9],[11,11],[11,13],
    [12,1],[12,5],[12,11],
    [13,1],[13,3],[13,5],[13,7],[13,9],[13,10],[13,11],[13,13],
  ];
  walls.forEach(([r,c]) => { if (r < GRID_SIZE && c < GRID_SIZE) maze[r][c] = 1; });
  return maze;
}

function generateDots(maze: number[][]): Position[] {
  const dots: Position[] = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      if (maze[y][x] === 0 && !(x === 0 && y === 0)) {
        if (Math.random() > 0.4) dots.push({ x, y });
      }
    }
  }
  return dots;
}

export default function PlayPage() {
  const [maze] = useState(generateMaze);
  const [player, setPlayer] = useState<Position>({ x: 0, y: 0 });
  const [dots, setDots] = useState<Position[]>(() => generateDots(generateMaze()));
  const [enemies, setEnemies] = useState<Position[]>([
    { x: 14, y: 14 }, { x: 14, y: 0 }, { x: 7, y: 7 },
  ]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);

  const resetGame = () => {
    setPlayer({ x: 0, y: 0 });
    setDots(generateDots(maze));
    setEnemies([{ x: 14, y: 14 }, { x: 14, y: 0 }, { x: 7, y: 7 }]);
    setScore(0);
    setLives(3);
    setGameOver(false);
    setTime(0);
    setIsPlaying(true);
  };

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!isPlaying || gameOver) return;
    setPlayer(prev => {
      const nx = prev.x + dx;
      const ny = prev.y + dy;
      if (nx < 0 || nx >= GRID_SIZE || ny < 0 || ny >= GRID_SIZE) return prev;
      if (maze[ny][nx] === 1) return prev;
      return { x: nx, y: ny };
    });
  }, [isPlaying, gameOver, maze]);

  // Keyboard controls
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': case 'w': movePlayer(0, -1); break;
        case 'ArrowDown': case 's': movePlayer(0, 1); break;
        case 'ArrowLeft': case 'a': movePlayer(-1, 0); break;
        case 'ArrowRight': case 'd': movePlayer(1, 0); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [movePlayer]);

  // Collect dots
  useEffect(() => {
    setDots(prev => {
      const next = prev.filter(d => !(d.x === player.x && d.y === player.y));
      if (next.length < prev.length) setScore(s => s + 100);
      return next;
    });
  }, [player]);

  // Enemy movement
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
      setEnemies(prev => prev.map(enemy => {
        const dirs = [
          { x: enemy.x + 1, y: enemy.y },
          { x: enemy.x - 1, y: enemy.y },
          { x: enemy.x, y: enemy.y + 1 },
          { x: enemy.x, y: enemy.y - 1 },
        ].filter(p => p.x >= 0 && p.x < GRID_SIZE && p.y >= 0 && p.y < GRID_SIZE && maze[p.y][p.x] === 0);
        
        // Bias toward player
        if (dirs.length === 0) return enemy;
        const toward = dirs.sort((a, b) => {
          const da = Math.abs(a.x - player.x) + Math.abs(a.y - player.y);
          const db = Math.abs(b.x - player.x) + Math.abs(b.y - player.y);
          return da - db;
        });
        return Math.random() > 0.4 ? toward[0] : dirs[Math.floor(Math.random() * dirs.length)];
      }));
    }, 500);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, maze, player]);

  // Check enemy collision
  useEffect(() => {
    if (enemies.some(e => e.x === player.x && e.y === player.y)) {
      setLives(l => {
        const next = l - 1;
        if (next <= 0) { setGameOver(true); setIsPlaying(false); }
        return next;
      });
      setPlayer({ x: 0, y: 0 });
    }
  }, [enemies, player]);

  // Timer
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <AppShell>
      <div className="h-[calc(100vh-57px)] grid-floor scanlines overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 md:p-6">
          {/* Game header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="font-display text-xl tracking-wider text-foreground neon-cyan">{MOCK_GENERATED_GAME.title}</h2>
                <p className="text-xs text-muted-foreground font-body">Inspired by {MOCK_GENERATED_GAME.inspiration} · {MOCK_GENERATED_GAME.theme}</p>
              </div>
              <div className="flex gap-2">
                <button className="font-display text-[10px] tracking-wider px-3 py-1.5 rounded border border-neon-magenta/50 text-neon-magenta hover:bg-neon-magenta/10 transition-colors">
                  🎨 REGENERATE THEME
                </button>
                <button className="font-display text-[10px] tracking-wider px-3 py-1.5 rounded border border-primary/50 text-primary hover:bg-primary/10 transition-colors">
                  👥 INVITE FRIEND
                </button>
              </div>
            </div>
          </motion.div>

          {/* Game viewport with ambilight */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative mb-6"
          >
            {/* Ambilight glow */}
            <div className="absolute -inset-4 bg-neon-cyan/10 rounded-lg blur-xl" />
            
            <div className="relative bg-background border-2 border-primary/30 rounded border-glow-cyan p-4">
              {/* HUD */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-4">
                  <div className="font-display text-xs tracking-wider text-primary">SCORE: <span className="text-foreground">{score}</span></div>
                  <div className="font-display text-xs tracking-wider text-neon-magenta">LIVES: <span className="text-foreground">{'❤️'.repeat(lives)}</span></div>
                  <div className="font-display text-xs tracking-wider text-neon-green">TIME: <span className="text-foreground">{formatTime(time)}</span></div>
                </div>
                <div className="flex gap-2">
                  {!isPlaying && !gameOver && (
                    <button onClick={() => { setIsPlaying(true); }} className="bg-neon-green text-background font-display text-[10px] tracking-wider px-3 py-1 rounded">▶ PLAY</button>
                  )}
                  {isPlaying && (
                    <button onClick={() => setIsPlaying(false)} className="bg-muted text-foreground font-display text-[10px] tracking-wider px-3 py-1 rounded">⏸ PAUSE</button>
                  )}
                  <button onClick={resetGame} className="bg-muted text-foreground font-display text-[10px] tracking-wider px-3 py-1 rounded">↺ RESTART</button>
                </div>
              </div>

              {/* Game grid */}
              <div className="flex justify-center">
                <div
                  className="relative border border-border rounded overflow-hidden"
                  style={{ width: GRID_SIZE * CELL_SIZE, height: GRID_SIZE * CELL_SIZE }}
                >
                  {/* Grid lines */}
                  {Array.from({ length: GRID_SIZE }).map((_, y) =>
                    Array.from({ length: GRID_SIZE }).map((_, x) => (
                      <div
                        key={`${x}-${y}`}
                        className={`absolute border border-border/20 ${maze[y][x] === 1 ? 'bg-surface-elevated' : ''}`}
                        style={{ left: x * CELL_SIZE, top: y * CELL_SIZE, width: CELL_SIZE, height: CELL_SIZE }}
                      />
                    ))
                  )}

                  {/* Dots */}
                  {dots.map((d, i) => (
                    <div
                      key={`dot-${i}`}
                      className="absolute w-2 h-2 bg-primary rounded-full"
                      style={{ left: d.x * CELL_SIZE + CELL_SIZE / 2 - 4, top: d.y * CELL_SIZE + CELL_SIZE / 2 - 4 }}
                    />
                  ))}

                  {/* Enemies */}
                  {enemies.map((e, i) => (
                    <div
                      key={`enemy-${i}`}
                      className="absolute text-lg transition-all duration-300"
                      style={{ left: e.x * CELL_SIZE + 2, top: e.y * CELL_SIZE + 1 }}
                    >
                      👹
                    </div>
                  ))}

                  {/* Player */}
                  <div
                    className="absolute text-xl transition-all duration-150"
                    style={{ left: player.x * CELL_SIZE + 1, top: player.y * CELL_SIZE - 1 }}
                  >
                    ⚡
                  </div>

                  {/* Game over overlay */}
                  {gameOver && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-display text-xl text-destructive mb-2 tracking-wider">GAME OVER</p>
                        <p className="font-body text-sm text-muted-foreground mb-3">Final Score: {score}</p>
                        <button onClick={resetGame} className="bg-primary text-primary-foreground font-display text-xs tracking-wider px-4 py-2 rounded">PLAY AGAIN</button>
                      </div>
                    </div>
                  )}

                  {/* Start overlay */}
                  {!isPlaying && !gameOver && time === 0 && (
                    <div className="absolute inset-0 bg-background/80 flex items-center justify-center cursor-pointer" onClick={() => setIsPlaying(true)}>
                      <div className="text-center">
                        <p className="font-display text-lg text-primary mb-2 tracking-wider neon-cyan">NEON MAZE RUNNER</p>
                        <p className="font-body text-xs text-muted-foreground mb-1">Use arrow keys or WASD to move</p>
                        <p className="font-body text-xs text-muted-foreground">Collect dots. Avoid enemies.</p>
                        <p className="font-display text-sm text-primary mt-3 animate-pulse tracking-wider">CLICK TO START</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile controls */}
              <div className="flex justify-center mt-4 md:hidden">
                <div className="grid grid-cols-3 gap-1 w-32">
                  <div />
                  <button onClick={() => movePlayer(0,-1)} className="bg-muted text-foreground rounded p-2 text-center font-display text-xs">↑</button>
                  <div />
                  <button onClick={() => movePlayer(-1,0)} className="bg-muted text-foreground rounded p-2 text-center font-display text-xs">←</button>
                  <button onClick={() => movePlayer(0,1)} className="bg-muted text-foreground rounded p-2 text-center font-display text-xs">↓</button>
                  <button onClick={() => movePlayer(1,0)} className="bg-muted text-foreground rounded p-2 text-center font-display text-xs">→</button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Why this was generated */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card border border-border rounded p-5"
          >
            <h3 className="font-display text-xs tracking-wider text-primary mb-3">WHY THIS WAS GENERATED FOR YOU</h3>
            <p className="text-sm font-body text-muted-foreground mb-3">{MOCK_GENERATED_GAME.mechanic}</p>
            <p className="text-sm font-body text-muted-foreground">
              Based on your preference for <span className="text-neon-magenta">fast-paced action</span>, <span className="text-primary">classic arcade gameplay</span>, and <span className="text-neon-green">cyber-mythic aesthetics</span>, we selected a maze-chase base game with adaptive AI enemies that evolve with your playstyle.
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              {['Pac-Man inspired', 'Adaptive AI', 'Neon visuals', 'Cyber-mythology', 'Dynamic difficulty'].map(tag => (
                <span key={tag} className="text-[10px] font-display tracking-wider px-2.5 py-1 rounded-full border border-border text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </AppShell>
  );
}
