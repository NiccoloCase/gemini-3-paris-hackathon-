import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MOCK_GENERATED_GAME } from '@/lib/mockData';
import { useLobby } from '@/hooks/useLobby';

// Placeholder HTML game — will be replaced by LLM-generated content
const PLACEHOLDER_GAME_HTML = `
<!DOCTYPE html>
<html>
<head>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a1a; overflow: hidden; display: flex; align-items: center; justify-content: center; height: 100vh; }
  canvas { display: block; }
</style>
</head>
<body>
<canvas id="c"></canvas>
<script>
const c = document.getElementById('c');
const ctx = c.getContext('2d');
c.width = c.height = Math.min(window.innerWidth, window.innerHeight);
const S = c.width;
const G = 20;
const CS = S / G;

let snake = [{x:10,y:10}];
let dir = {x:1,y:0};
let food = spawn();
let score = 0;
let speed = 120;

function spawn() {
  let p;
  do { p = {x:Math.floor(Math.random()*G),y:Math.floor(Math.random()*G)}; }
  while (snake.some(s=>s.x===p.x&&s.y===p.y));
  return p;
}

document.addEventListener('keydown', e => {
  const k = e.key;
  if ((k==='ArrowUp'||k==='w') && dir.y===0) dir={x:0,y:-1};
  if ((k==='ArrowDown'||k==='s') && dir.y===0) dir={x:0,y:1};
  if ((k==='ArrowLeft'||k==='a') && dir.x===0) dir={x:-1,y:0};
  if ((k==='ArrowRight'||k==='d') && dir.x===0) dir={x:1,y:0};
});

function draw() {
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0,0,S,S);

  // Grid
  ctx.strokeStyle = 'rgba(0,229,255,0.06)';
  for(let i=0;i<=G;i++){
    ctx.beginPath(); ctx.moveTo(i*CS,0); ctx.lineTo(i*CS,S); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,i*CS); ctx.lineTo(S,i*CS); ctx.stroke();
  }

  // Food
  ctx.shadowBlur = 15;
  ctx.shadowColor = '#ff2d95';
  ctx.fillStyle = '#ff2d95';
  ctx.beginPath();
  ctx.arc(food.x*CS+CS/2, food.y*CS+CS/2, CS/3, 0, Math.PI*2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Snake
  snake.forEach((s,i) => {
    const alpha = 1 - (i / snake.length) * 0.6;
    ctx.shadowBlur = i===0 ? 12 : 6;
    ctx.shadowColor = '#00e5ff';
    ctx.fillStyle = 'rgba(0,229,255,' + alpha + ')';
    ctx.fillRect(s.x*CS+1, s.y*CS+1, CS-2, CS-2);
  });
  ctx.shadowBlur = 0;

  // Score
  ctx.fillStyle = 'rgba(0,229,255,0.8)';
  ctx.font = '14px monospace';
  ctx.fillText('SCORE: ' + score, 8, 20);
}

function update() {
  const head = {x:snake[0].x+dir.x, y:snake[0].y+dir.y};

  if (head.x<0||head.x>=G||head.y<0||head.y>=G||snake.some(s=>s.x===head.x&&s.y===head.y)) {
    // Game over — restart
    snake = [{x:10,y:10}];
    dir = {x:1,y:0};
    food = spawn();
    score = 0;
    speed = 120;
    return;
  }

  snake.unshift(head);
  if (head.x===food.x && head.y===food.y) {
    score += 10;
    food = spawn();
    if (speed > 60) speed -= 2;
  } else {
    snake.pop();
  }
}

function loop() {
  update();
  draw();
  setTimeout(loop, speed);
}
loop();
</script>
</body>
</html>`;

export default function PlayPage() {
  const { updateStatus } = useLobby();
  const navigate = useNavigate();

  useEffect(() => {
    updateStatus("Playing", MOCK_GENERATED_GAME.title);
    return () => { updateStatus("Idle"); };
  }, []);

  const gameHtml = PLACEHOLDER_GAME_HTML;

  return (
    <div className="h-screen bg-black flex items-center justify-center overflow-hidden">
      {/* Arcade cabinet */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex flex-col items-center"
        style={{ maxWidth: 640, width: '100%' }}
      >
        {/* Cabinet top / marquee */}
        <div
          className="w-full relative"
          style={{
            background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
            borderRadius: '18px 18px 0 0',
            border: '2px solid rgba(255,255,255,0.06)',
            borderBottom: 'none',
            padding: '12px 20px 8px',
          }}
        >
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)',
                '0 0 30px rgba(0,229,255,0.5), 0 0 80px rgba(0,229,255,0.15)',
                '0 0 20px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center justify-between px-4 py-2"
            style={{
              background: 'linear-gradient(90deg, #00e5ff22, #ff2d9522, #00e5ff22)',
              borderRadius: 6,
              border: '1px solid rgba(0,229,255,0.15)',
            }}
          >
            <span className="font-pixel text-[8px] text-cyan-400/80 tracking-[0.3em]">ARCADIA</span>
            <span className="font-pixel text-[7px] text-white/40 tracking-widest">{MOCK_GENERATED_GAME.title.toUpperCase()}</span>
            <span className="font-pixel text-[8px] text-cyan-400/80 tracking-[0.3em]">P1</span>
          </motion.div>
        </div>

        {/* Screen bezel */}
        <div
          className="w-full relative"
          style={{
            background: 'linear-gradient(180deg, #0f0f1a 0%, #0a0a14 100%)',
            border: '2px solid rgba(255,255,255,0.06)',
            borderTop: 'none',
            padding: '6px 16px 12px',
          }}
        >
          {/* Screen glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 40%, rgba(0,229,255,0.04) 0%, transparent 70%)',
            }}
          />

          {/* The actual game screen */}
          <div
            className="relative w-full overflow-hidden"
            style={{
              aspectRatio: '1',
              borderRadius: 4,
              border: '2px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8), 0 0 40px rgba(0,229,255,0.08)',
            }}
          >
            {/* Scanlines overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)',
              }}
            />

            {/* Screen edge vignette */}
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                boxShadow: 'inset 0 0 60px rgba(0,0,0,0.5)',
                borderRadius: 4,
              }}
            />

            {/* Game iframe */}
            <iframe
              srcDoc={gameHtml}
              className="w-full h-full border-0"
              style={{ display: 'block', background: '#0a0a1a' }}
              sandbox="allow-scripts"
              title="Arcade Game"
            />
          </div>
        </div>

        {/* Controls panel */}
        <div
          className="w-full flex items-center justify-between px-6 py-4"
          style={{
            background: 'linear-gradient(180deg, #0a0a14 0%, #12121f 100%)',
            border: '2px solid rgba(255,255,255,0.06)',
            borderTop: 'none',
            borderRadius: '0 0 12px 12px',
          }}
        >
          {/* Joystick visual */}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center">
              <div className="w-[3px] h-[14px] rounded-full bg-white/15" />
              <div className="w-[12px] h-[12px] rounded-full bg-white/8 border border-white/15" />
            </div>
            <span className="font-pixel text-[6px] text-white/20 tracking-widest">WASD / ARROWS</span>
          </div>

          {/* Back button */}
          <button
            onClick={() => navigate('/lobby')}
            className="font-pixel text-[7px] tracking-widest px-4 py-2 border border-white/10 text-white/40 hover:text-cyan-400 hover:border-cyan-400/30 transition-colors"
          >
            EXIT GAME
          </button>

          {/* Decorative buttons */}
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ boxShadow: ['0 0 4px #ff2d9544', '0 0 10px #ff2d9599', '0 0 4px #ff2d9544'] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="w-[10px] h-[10px] rounded-full"
              style={{ background: '#ff2d9566' }}
            />
            <motion.div
              animate={{ boxShadow: ['0 0 4px #00e5ff44', '0 0 10px #00e5ff99', '0 0 4px #00e5ff44'] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="w-[10px] h-[10px] rounded-full"
              style={{ background: '#00e5ff66' }}
            />
            <div className="w-[10px] h-[10px] rounded-full bg-white/8" />
          </div>
        </div>

        {/* Cabinet shadow */}
        <div
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: '80%',
            height: 20,
            borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(0,229,255,0.08) 0%, transparent 70%)',
            filter: 'blur(8px)',
          }}
        />
      </motion.div>
    </div>
  );
}
