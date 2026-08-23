import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useInView } from 'framer-motion';
import PixelBox from './PixelBox';

// ─── Constants ──────────────────────────────────────────────────────────────
const S = 3;
const CW = 480, CH = 380;
const E_COLS = 8, E_ROWS = 3;
const E_W = 11 * S, E_H = 8 * S;
const E_CELL_W = 44, E_CELL_H = 40;
const E_GRID_W = E_COLS * E_CELL_W;
const E_GRID_X = (CW - E_GRID_W) / 2;
const E_GRID_Y = 38;
const PL_W = 11 * S, PL_H = 7 * S;
const PL_Y = CH - 58;
const PL_SPEED = 3;
const MAX_PL_X = CW - PL_W;
const BUL_W = S;
const PBL_H = 14, EBL_H = 14;
const PBL_SPD = 8, EBL_SPD = 3;
const SHOOT_CD = 550;
const E_DROP = 18;
const E_SCORES = [30, 20, 10] as const;

// ─── Sprites ─────────────────────────────────────────────────────────────────
const PLAYER_SPR = [
  [0,0,0,0,0,1,0,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0],
  [0,0,0,0,1,1,1,0,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,1,0,1,0,1,0,0,1],
];

const ENEMY_SPR: number[][][][] = [
  [
    [[0,0,1,0,0,0,0,0,1,0,0],[0,0,0,1,0,0,0,1,0,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,0,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,1,1,0,1],[1,0,1,0,0,0,0,0,1,0,1],[0,0,0,1,1,0,1,1,0,0,0]],
    [[0,0,1,0,0,0,0,0,1,0,0],[1,0,0,1,0,0,0,1,0,0,1],[1,1,1,1,1,1,1,1,1,1,1],[1,1,0,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[0,0,1,1,1,1,1,1,1,0,0],[0,0,1,0,0,0,0,0,1,0,0],[1,1,0,0,0,0,0,0,0,1,1]],
  ],
  [
    [[0,1,0,0,0,0,0,0,0,1,0],[1,0,0,1,0,0,0,1,0,0,1],[1,0,1,1,1,1,1,1,1,0,1],[1,1,1,0,1,1,1,0,1,1,1],[1,1,1,1,1,1,1,1,1,1,1],[0,1,1,1,1,1,1,1,1,1,0],[0,1,0,0,0,0,0,0,0,1,0],[0,0,1,1,0,0,0,1,1,0,0]],
    [[0,1,0,0,0,0,0,0,0,1,0],[0,0,0,1,0,0,0,1,0,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,0,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,1,1,0,1],[1,0,0,0,0,0,0,0,0,0,1],[1,1,0,0,0,0,0,0,0,1,1]],
  ],
  [
    [[0,0,0,1,1,1,1,1,0,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,0,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[0,0,1,1,1,1,1,1,1,0,0],[0,0,1,0,1,1,1,0,1,0,0],[0,1,0,0,0,0,0,0,0,1,0],[0,0,1,0,0,0,0,0,1,0,0]],
    [[0,0,0,1,1,1,1,1,0,0,0],[0,1,1,1,1,1,1,1,1,1,0],[1,1,0,1,1,1,1,1,0,1,1],[1,1,1,1,1,1,1,1,1,1,1],[1,0,1,1,1,1,1,1,1,0,1],[1,0,0,0,1,1,1,0,0,0,1],[0,0,1,0,0,0,0,0,1,0,0],[1,1,0,0,0,0,0,0,0,1,1]],
  ],
];

const ENEMY_COLORS = ['#ff6ec7', '#ffd700', '#00e5ff'];

// ─── Types ───────────────────────────────────────────────────────────────────
interface Enemy   { id:number; row:number; col:number; x:number; y:number; alive:boolean; type:0|1|2; }
interface Bullet  { id:number; x:number; y:number; }
interface Boom    { id:number; x:number; y:number; frame:number; timer:number; }
interface Keys    { left:boolean; right:boolean; shoot:boolean; }
type Status = 'idle'|'playing'|'gameover'|'win';

interface G {
  status: Status;
  playerX: number;
  lives: number;
  score: number;
  enemies: Enemy[];
  pBullets: Bullet[];
  eBullets: Bullet[];
  booms: Boom[];
  enemyDX: 1|-1;
  enemyMoveTimer: number;
  enemyDropQueued: boolean;
  enemyShootTimer: number;
  animTimer: number;
  animFrame: 0|1;
  idCtr: number;
  lastShot: number;
}

// ─── Pure helpers ────────────────────────────────────────────────────────────
function drawSprite(ctx: CanvasRenderingContext2D, spr: number[][], x: number, y: number, color: string) {
  ctx.fillStyle = color;
  for (let r = 0; r < spr.length; r++)
    for (let c = 0; c < spr[r].length; c++)
      if (spr[r][c]) ctx.fillRect(x + c * S, y + r * S, S, S);
}

function mkEnemies(): Enemy[] {
  const arr: Enemy[] = [];
  for (let row = 0; row < E_ROWS; row++)
    for (let col = 0; col < E_COLS; col++)
      arr.push({
        id: row * E_COLS + col,
        row, col,
        x: E_GRID_X + col * E_CELL_W + (E_CELL_W - E_W) / 2,
        y: E_GRID_Y + row * E_CELL_H,
        alive: true,
        type: row as 0|1|2,
      });
  return arr;
}

function freshG(): G {
  return {
    status: 'playing',
    playerX: (CW - PL_W) / 2,
    lives: 3,
    score: 0,
    enemies: mkEnemies(),
    pBullets: [], eBullets: [], booms: [],
    enemyDX: 1,
    enemyMoveTimer: 800,
    enemyDropQueued: false,
    enemyShootTimer: 1800,
    animTimer: 0,
    animFrame: 0,
    idCtr: 0,
    lastShot: 0,
  };
}

function render(ctx: CanvasRenderingContext2D, g: G) {
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, CW, CH);

  // Stars
  ctx.fillStyle = '#ffd70044';
  for (let i = 0; i < 50; i++)
    ctx.fillRect((i * 53 + 11) % CW, (i * 47 + 17) % (CH - 70), 1 + (i % 2), 1 + (i % 2));

  // Ground
  ctx.fillStyle = '#ffd700';
  ctx.fillRect(0, PL_Y + PL_H + 4, CW, 2);

  // Enemy bullets
  g.eBullets.forEach(b => {
    ctx.fillStyle = '#ff6ec7';
    ctx.fillRect(b.x, b.y, BUL_W, EBL_H);
    ctx.fillStyle = '#ff6ec733';
    ctx.fillRect(b.x - 1, b.y, BUL_W + 2, EBL_H);
  });

  // Player bullets
  g.pBullets.forEach(b => {
    ctx.fillStyle = '#39ff14';
    ctx.fillRect(b.x, b.y, BUL_W, PBL_H);
    ctx.fillStyle = '#39ff1444';
    ctx.fillRect(b.x - 1, b.y - 2, BUL_W + 2, PBL_H + 4);
  });

  // Enemies
  g.enemies.forEach(e => {
    if (!e.alive) return;
    drawSprite(ctx, ENEMY_SPR[e.type][g.animFrame], e.x, e.y, ENEMY_COLORS[e.type]);
  });

  // Player
  if (g.status === 'playing' || g.status === 'win') {
    drawSprite(ctx, PLAYER_SPR, g.playerX, PL_Y, '#39ff14');
    // glow effect
    ctx.fillStyle = '#39ff1422';
    ctx.fillRect(g.playerX - 2, PL_Y - 2, PL_W + 4, PL_H + 4);
  }

  // Explosions
  g.booms.forEach(ex => {
    const cs = ['#ffd700','#ff6ec7','#ff4444','#ffffff'];
    ctx.globalAlpha = Math.max(0, 1 - ex.frame * 0.24);
    ctx.fillStyle = cs[ex.frame % cs.length];
    const r = (ex.frame + 1) * S;
    ctx.fillRect(ex.x - r, ex.y - r/2, r*2, r);
    ctx.fillRect(ex.x - r/2, ex.y - r, r, r*2);
    ctx.globalAlpha = 1;
  });

  // Overlays
  if (g.status === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#ff4444';
    ctx.font = `13px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', CW/2, CH/2 - 22);
    ctx.fillStyle = '#ffd700';
    ctx.font = `8px 'Press Start 2P',monospace`;
    ctx.fillText(`FINAL SCORE: ${g.score}`, CW/2, CH/2 + 6);
    ctx.fillStyle = '#39ff1499';
    ctx.fillText('PRESS [R] TO RESTART', CW/2, CH/2 + 32);
  }
  if (g.status === 'win') {
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(0, 0, CW, CH);
    ctx.fillStyle = '#39ff14';
    ctx.font = `13px 'Press Start 2P',monospace`;
    ctx.textAlign = 'center';
    ctx.fillText('YOU WIN!!', CW/2, CH/2 - 22);
    ctx.fillStyle = '#ffd700';
    ctx.font = `8px 'Press Start 2P',monospace`;
    ctx.fillText(`SCORE: ${g.score}`, CW/2, CH/2 + 6);
    ctx.fillStyle = '#ff6ec799';
    ctx.fillText('PRESS [R] TO PLAY AGAIN', CW/2, CH/2 + 32);
  }
}

function renderIdle(ctx: CanvasRenderingContext2D) {
  ctx.fillStyle = '#0f0f23';
  ctx.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 50; i++) {
    ctx.fillStyle = '#ffd70055';
    ctx.fillRect((i * 53 + 11) % CW, (i * 47 + 17) % (CH - 70), 1 + (i % 2), 1 + (i % 2));
  }
  for (let r = 0; r < 3; r++)
    for (let c = 0; c < 5; c++)
      drawSprite(ctx, ENEMY_SPR[r][0], 75 + c * 62, 50 + r * 52, ENEMY_COLORS[r]);

  ctx.fillStyle = '#ffd700';
  ctx.font = `10px 'Press Start 2P',monospace`;
  ctx.textAlign = 'center';
  ctx.fillText('SPACE INVADERS', CW/2, CH - 100);
  ctx.fillStyle = '#39ff14';
  ctx.font = `7px 'Press Start 2P',monospace`;
  ctx.fillText('PRESS START TO PLAY', CW/2, CH - 70);
  ctx.fillStyle = '#ffd70066';
  ctx.fillText('← → MOVE  |  SPACE SHOOT', CW/2, CH - 46);
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function MiniGame() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.1 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef   = useRef<G>(freshG());
  const keysRef   = useRef<Keys>({ left: false, right: false, shoot: false });
  const rafRef    = useRef<number>(0);
  const lastTRef  = useRef<number>(0);
  const prevScore = useRef(0);
  const prevLives = useRef(3);

  const [score,      setScore]      = useState(0);
  const [lives,      setLives]      = useState(3);
  const [gameStatus, setGameStatus] = useState<Status>('idle');

  const gameLoop = useCallback((ts: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const g = gameRef.current;
    const keys = keysRef.current;

    if (g.status !== 'playing') {
      render(ctx, g);
      rafRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    const dt = Math.min(ts - lastTRef.current, 50);
    lastTRef.current = ts;

    // Player move
    if (keys.left)  g.playerX = Math.max(0,       g.playerX - PL_SPEED);
    if (keys.right) g.playerX = Math.min(MAX_PL_X, g.playerX + PL_SPEED);

    // Player shoot
    if (keys.shoot && ts - g.lastShot > SHOOT_CD && g.pBullets.length < 3) {
      g.pBullets.push({ id: g.idCtr++, x: g.playerX + PL_W/2 - BUL_W/2, y: PL_Y - PBL_H });
      g.lastShot = ts;
    }

    // Move player bullets up
    for (let i = g.pBullets.length - 1; i >= 0; i--) {
      g.pBullets[i].y -= PBL_SPD;
      if (g.pBullets[i].y + PBL_H < 0) g.pBullets.splice(i, 1);
    }

    // Move enemy bullets down
    for (let i = g.eBullets.length - 1; i >= 0; i--) {
      g.eBullets[i].y += EBL_SPD;
      if (g.eBullets[i].y > CH) g.eBullets.splice(i, 1);
    }

    // Enemy animation
    g.animTimer += dt;
    if (g.animTimer > 440) { g.animTimer = 0; g.animFrame = g.animFrame === 0 ? 1 : 0; }

    // Enemy movement
    g.enemyMoveTimer -= dt;
    if (g.enemyMoveTimer <= 0) {
      const alive = g.enemies.filter(e => e.alive);
      if (alive.length === 0) {
        g.status = 'win'; setGameStatus('win'); setScore(g.score);
      } else {
        if (g.enemyDropQueued) {
          alive.forEach(e => { e.y += E_DROP; });
          g.enemyDX = (g.enemyDX * -1) as 1|-1;
          g.enemyDropQueued = false;
        } else {
          const step = 6 * g.enemyDX;
          alive.forEach(e => { e.x += step; });
          const minX = Math.min(...alive.map(e => e.x));
          const maxX = Math.max(...alive.map(e => e.x + E_W));
          if (minX <= 2 || maxX >= CW - 2) g.enemyDropQueued = true;
        }
        const pct = alive.length / (E_COLS * E_ROWS);
        g.enemyMoveTimer = Math.max(60, 800 * pct);
        const bottomY = Math.max(...alive.map(e => e.y + E_H));
        if (bottomY >= PL_Y - 8) { g.status = 'gameover'; setGameStatus('gameover'); setScore(g.score); }
      }
    }

    // Enemy shoot
    g.enemyShootTimer -= dt;
    if (g.enemyShootTimer <= 0 && g.eBullets.length < 5) {
      const alive = g.enemies.filter(e => e.alive);
      const byCol = new Map<number, Enemy>();
      alive.forEach(e => { const ex = byCol.get(e.col); if (!ex || e.row > ex.row) byCol.set(e.col, e); });
      const pool = [...byCol.values()];
      if (pool.length) {
        const s = pool[Math.floor(Math.random() * pool.length)];
        g.eBullets.push({ id: g.idCtr++, x: s.x + E_W/2 - BUL_W/2, y: s.y + E_H });
      }
      g.enemyShootTimer = 900 + Math.random() * 1300;
    }

    // Player bullets ↔ enemies
    outer: for (let bi = g.pBullets.length - 1; bi >= 0; bi--) {
      const b = g.pBullets[bi];
      for (const e of g.enemies) {
        if (!e.alive) continue;
        if (b.x < e.x + E_W && b.x + BUL_W > e.x && b.y < e.y + E_H && b.y + PBL_H > e.y) {
          e.alive = false;
          g.score += E_SCORES[e.type];
          g.booms.push({ id: g.idCtr++, x: e.x + E_W/2, y: e.y + E_H/2, frame: 0, timer: 0 });
          g.pBullets.splice(bi, 1);
          continue outer;
        }
      }
    }

    // Enemy bullets ↔ player
    for (let bi = g.eBullets.length - 1; bi >= 0; bi--) {
      const b = g.eBullets[bi];
      if (b.x < g.playerX + PL_W && b.x + BUL_W > g.playerX && b.y < PL_Y + PL_H && b.y + EBL_H > PL_Y) {
        g.eBullets.splice(bi, 1);
        g.lives = Math.max(0, g.lives - 1);
        g.booms.push({ id: g.idCtr++, x: g.playerX + PL_W/2, y: PL_Y + PL_H/2, frame: 0, timer: 0 });
        if (g.lives <= 0) { g.status = 'gameover'; setGameStatus('gameover'); setScore(g.score); }
      }
    }

    // Explosions
    for (let i = g.booms.length - 1; i >= 0; i--) {
      g.booms[i].timer += dt;
      if (g.booms[i].timer > 85) { g.booms[i].timer = 0; g.booms[i].frame++; }
      if (g.booms[i].frame >= 5) g.booms.splice(i, 1);
    }

    // All enemies dead?
    if (g.status === 'playing' && g.enemies.every(e => !e.alive)) {
      g.status = 'win'; setGameStatus('win'); setScore(g.score);
    }

    // Sync UI
    if (g.score !== prevScore.current) { prevScore.current = g.score; setScore(g.score); }
    if (g.lives !== prevLives.current) { prevLives.current = g.lives; setLives(g.lives); }

    render(ctx, g);
    rafRef.current = requestAnimationFrame(gameLoop);
  }, []);

  const startGame = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    gameRef.current = freshG();
    prevScore.current = 0;
    prevLives.current = 3;
    setScore(0); setLives(3); setGameStatus('playing');
    lastTRef.current = performance.now();
    rafRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  // Keyboard
  useEffect(() => {
    const dn = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keysRef.current.left  = true;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = true;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        keysRef.current.shoot = true;
      }
      if ((e.key === 'r' || e.key === 'R') && (gameRef.current.status === 'gameover' || gameRef.current.status === 'win')) startGame();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft'  || e.key === 'a' || e.key === 'A') keysRef.current.left  = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') keysRef.current.right = false;
      if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') keysRef.current.shoot = false;
    };
    document.addEventListener('keydown', dn);
    document.addEventListener('keyup', up);
    return () => { document.removeEventListener('keydown', dn); document.removeEventListener('keyup', up); };
  }, [startGame]);

  // Draw idle screen
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderIdle(ctx);
  }, []);

  // Cleanup
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const borderColor = gameStatus === 'playing' ? '#39ff14' : gameStatus === 'gameover' ? '#ff4444' : gameStatus === 'win' ? '#ffd700' : '#ffd700';

  return (
    <section className="min-h-screen bg-bg py-16 px-4 pt-20 flex flex-col items-center">
      <div className="max-w-2xl w-full">
        <motion.div
          ref={sectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center mb-6"
        >
          <div className="font-pixel text-xs sm:text-sm text-cyan glow-cyan mb-2">▶ BONUS STAGE ◀</div>
          <h2 className="font-pixel text-gold text-lg sm:text-2xl glow-gold mb-2">ARCADE</h2>
          <div className="font-vt text-xl text-gold opacity-60">Destroy all invaders to proceed</div>
        </motion.div>

        {/* HUD */}
        <div className="flex justify-between items-center mb-2 px-1 font-pixel text-[8px]">
          <div className="text-gold">
            SCORE: <span className="text-neon">{score.toString().padStart(6, '0')}</span>
          </div>
          <div className="text-gold flex items-center gap-1">
            {[...Array(3)].map((_, i) => (
              <span key={i} className="text-pink text-sm" style={{ opacity: i < lives ? 1 : 0.18 }}>♥</span>
            ))}
          </div>
          <div className="text-gold">
            HI: <span className="text-pink">050000</span>
          </div>
        </div>

        {/* Canvas */}
        <PixelBox color={borderColor} glow={gameStatus === 'playing'} className="p-1">
          <canvas
            ref={canvasRef}
            width={CW}
            height={CH}
            style={{
              imageRendering: 'pixelated',
              display: 'block',
              width: '100%',
              height: 'auto',
              maxWidth: CW,
            }}
          />
        </PixelBox>

        {/* Buttons */}
        <div className="mt-4 space-y-3">
          <div className="flex gap-3 justify-center flex-wrap">
            {gameStatus === 'idle' && (
              <button onClick={startGame} className="pixel-btn font-pixel text-[9px] text-neon px-8 py-3 glow-neon">
                ▶ START GAME
              </button>
            )}
            {(gameStatus === 'gameover' || gameStatus === 'win') && (
              <button onClick={startGame} className="pixel-btn font-pixel text-[9px] text-gold px-8 py-3">
                ↺ PLAY AGAIN [R]
              </button>
            )}
          </div>

          {/* Touch controls */}
          <div className="flex gap-3 justify-center">
            <button
              onPointerDown={() => (keysRef.current.left = true)}
              onPointerUp={() => (keysRef.current.left = false)}
              onPointerLeave={() => (keysRef.current.left = false)}
              className="pixel-btn font-pixel text-xl text-gold px-5 py-3 select-none"
              aria-label="Move left"
            >◀</button>
            <button
              onPointerDown={() => (keysRef.current.shoot = true)}
              onPointerUp={() => (keysRef.current.shoot = false)}
              onPointerLeave={() => (keysRef.current.shoot = false)}
              className="pixel-btn font-pixel text-[9px] text-pink px-5 py-3 select-none glow-pink"
              aria-label="Fire"
            >FIRE ✦</button>
            <button
              onPointerDown={() => (keysRef.current.right = true)}
              onPointerUp={() => (keysRef.current.right = false)}
              onPointerLeave={() => (keysRef.current.right = false)}
              className="pixel-btn font-pixel text-xl text-gold px-5 py-3 select-none"
              aria-label="Move right"
            >▶</button>
          </div>

          <div className="font-pixel text-[7px] text-gold opacity-35 text-center">
            A/D or ← → : MOVE &nbsp;·&nbsp; SPACE or W : FIRE &nbsp;·&nbsp; R : RESTART
          </div>
        </div>

        {/* Score legend */}
        <div className="mt-5 flex justify-center gap-6">
          {([0, 1, 2] as const).map((type) => (
            <div key={type} className="flex items-center gap-2">
              <canvas
                width={E_W} height={E_H}
                style={{ imageRendering: 'pixelated' }}
                ref={(el) => {
                  if (!el) return;
                  const ctx = el.getContext('2d');
                  if (!ctx) return;
                  ctx.clearRect(0, 0, E_W, E_H);
                  drawSprite(ctx, ENEMY_SPR[type][0], 0, 0, ENEMY_COLORS[type]);
                }}
              />
              <span className="font-pixel text-[7px]" style={{ color: ENEMY_COLORS[type] }}>
                = {E_SCORES[type]} PTS
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
