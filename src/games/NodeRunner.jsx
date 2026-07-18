import React, { useState, useEffect, useRef } from 'react';
import './NodeRunner.css';

// World geometry (all in px, bottom-up coordinate space with y=0 at the
// ground line). The stage is a fixed logical size — CSS scales the wrapper
// down for mobile but the physics stay in these units for stability.
const WORLD_W = 800;
const WORLD_H = 320;
const GROUND_Y = 40;
const PLAYER_X = 120;
const PLAYER_W = 24;
const PLAYER_H = 40;
const PLAYER_H_SLIDE = 18;

const GRAVITY = 2600;
const JUMP_VY = 940;
const START_SPEED = 340;
const MAX_SPEED = 920;
const ACCEL = 14;
// Hold-to-slide: no fixed duration — release ↓ (or land after an in-air ↓)
// ends the slide. A short minimum keeps taps from feeling ignored.
const SLIDE_MIN_MS = 140;
// Reaction time floor for obstacle spacing — a player must always have at
// least this many seconds of run visible before the next hazard, no matter
// how fast the world is scrolling. Prevents unfair back-to-back spawns at
// max speed.
const MIN_REACTION_S = 0.85;
// Packet clusters also respect a distance-based cushion from obstacles so
// nothing overlaps the collectibles.
const PACKET_CLEARANCE = 90;

// Each obstacle type is either a jump-required (low, sits on the ground)
// or slide-required (hangs from above so a standing OR jumping player
// collides but a sliding player passes underneath).
//
// Slide-obstacle geometry note: the scan beam MUST be tall enough that
// the player's jump arc can't clear the top edge — otherwise a player
// discovers they can just jump every hazard and never bother sliding.
// Peak jump apex (top of the player) with the current physics constants
// works out to ~210px above the ground, so we give the beam a bottom
// edge just above the slide-crouch height (18px → sits at y=24) and
// extend it upward to y=240. That leaves a slide window of 24px at the
// floor, and anywhere else in the y-range results in a hit.
const OBSTACLES = {
  firewall: { char: '▓', w: 22, h: 48,  y: 0,  need: 'jump'  },
  spike:    { char: '▲', w: 20, h: 30,  y: 0,  need: 'jump'  },
  beam:     { char: '║', w: 22, h: 216, y: 24, need: 'slide' },
  block:    { char: '▒', w: 26, h: 40,  y: 0,  need: 'jump'  },
};
const OBSTACLE_TYPES = Object.keys(OBSTACLES);

const initialGameState = () => ({
  playerY: 0,
  vy: 0,
  // Slide model: pressing ↓ arms `slideHeld`. If the player is grounded,
  // they enter slide immediately; if airborne, they auto-slide the moment
  // they touch down. Slide stays active while `slideHeld` is true (plus a
  // brief minimum so a quick tap still registers).
  sliding: false,
  slideHeld: false,
  slideStart: 0,
  speed: START_SPEED,
  distance: 0,
  score: 0,
  dodges: 0,
  obstacles: [],
  packets: [],
  nextObstacleDist: 480,
  nextPacketDist: 280,
});

const distanceToMeters = (px) => Math.floor(px / 12);

export default function NodeRunner({ onClose }) {
  const [gameState, setGameState] = useState('menu');
  const [countdown, setCountdown] = useState(3);
  const [scores, setScores] = useState([]);
  const [finalStats, setFinalStats] = useState(null);
  const stateRef = useRef(initialGameState());
  const [, forceRender] = useState(0);
  const tick = () => forceRender((v) => (v + 1) & 0xffff);

  useEffect(() => {
    const raw = localStorage.getItem('nodeRunnerScores');
    if (raw) {
      try { setScores(JSON.parse(raw)); } catch { /* corrupt entry, ignore */ }
    }
  }, []);

  const start = () => {
    stateRef.current = initialGameState();
    setFinalStats(null);
    setGameState('countdown');
    setCountdown(3);
    let n = 3;
    const iv = setInterval(() => {
      n -= 1;
      if (n <= 0) {
        clearInterval(iv);
        setGameState('playing');
      } else {
        setCountdown(n);
      }
    }, 750);
  };

  // Main physics loop — mounted only while gameState==='playing'. The
  // cleanup flag `alive` guarantees a pending RAF frame no-ops after we
  // transition to 'over', so we can't leak a final tick past game end.
  useEffect(() => {
    if (gameState !== 'playing') return;

    let alive = true;
    let last = performance.now();
    let handoff = null;

    const endGame = () => {
      const s = stateRef.current;
      const stats = {
        distance: distanceToMeters(s.distance),
        dodges: s.dodges,
        packets: s.score,
        ts: performance.now(),
      };
      setFinalStats(stats);
      setScores((prev) => {
        const next = [...prev, stats]
          .sort((a, b) => b.distance - a.distance)
          .slice(0, 10);
        localStorage.setItem('nodeRunnerScores', JSON.stringify(next));
        return next;
      });
      setGameState('over');
    };

    const step = (now) => {
      if (!alive) return;
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;
      const s = stateRef.current;

      // Gravity & jump arc.
      const wasAirborne = s.playerY > 0 || s.vy > 0;
      if (wasAirborne) {
        s.vy -= GRAVITY * dt;
        s.playerY += s.vy * dt;
        if (s.playerY <= 0) { s.playerY = 0; s.vy = 0; }
      }
      // Slide resolution:
      // - grounded + slideHeld → sliding
      // - just landed + slideHeld (pressed ↓ mid-air) → start sliding now
      // - slideHeld released → end slide once minimum duration elapsed
      // The minimum protects short taps from being canceled by keyup fired
      // in the same frame.
      if (s.playerY === 0 && s.slideHeld) {
        if (!s.sliding) {
          s.sliding = true;
          s.slideStart = now;
        }
      } else if (!s.slideHeld && s.sliding) {
        if (now - s.slideStart >= SLIDE_MIN_MS) s.sliding = false;
      }
      // Airborne cancels an active slide — you can't slide off the ground.
      if (s.playerY > 0 && s.sliding) s.sliding = false;

      // World scroll — accelerates until it hits MAX_SPEED.
      s.speed = Math.min(MAX_SPEED, s.speed + ACCEL * dt);
      const dx = s.speed * dt;
      s.distance += dx;

      // Move everything left; count dodges as obstacles leave the stage.
      for (const o of s.obstacles) o.x -= dx;
      for (const p of s.packets) p.x -= dx;
      s.obstacles = s.obstacles.filter((o) => {
        if (o.x + o.w < -20) {
          if (!o.hit) s.dodges += 1;
          return false;
        }
        return true;
      });
      s.packets = s.packets.filter((p) => p.x + p.w > -20);

      // Obstacle spawning — the gap between successive obstacles is
      // grounded in reaction time: at any speed, the next hazard must
      // appear at least (MIN_REACTION_S * speed) px away from the last
      // one. A per-type buffer stacks on top (slide hazards need extra
      // spacing since setting up a slide has a landing lag). Random
      // padding gives the pacing texture instead of a metronome feel.
      if (s.distance >= s.nextObstacleDist) {
        const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
        const def = OBSTACLES[type];
        s.obstacles.push({
          type, char: def.char, need: def.need,
          x: WORLD_W + 30, y: def.y, w: def.w, h: def.h,
          hit: false,
        });
        const reactionGap = s.speed * MIN_REACTION_S;
        const typeBuffer = def.need === 'slide' ? 90 : 40;
        const jitter = Math.random() * 220;
        s.nextObstacleDist += reactionGap + typeBuffer + jitter;
      }
      // Packet clusters — same reaction-time logic so a packet trail
      // never leads directly into an obstacle. Also skip the spawn if it
      // would overlap the next obstacle's expected slot.
      if (s.distance >= s.nextPacketDist) {
        const distToNextObstacle = s.nextObstacleDist - s.distance;
        // If an obstacle is about to spawn right where these packets
        // would land, defer the packet trail. Prevents the "chase a coin
        // straight into a wall" trap.
        if (distToNextObstacle > PACKET_CLEARANCE + 120) {
          const baseY = 60 + Math.random() * 110;
          const count = 2 + Math.floor(Math.random() * 3);
          for (let i = 0; i < count; i++) {
            s.packets.push({
              x: WORLD_W + 40 + i * 28,
              y: baseY,
              w: 14,
              h: 14,
              collected: false,
            });
          }
          s.nextPacketDist += 380 + Math.random() * 260;
        } else {
          // Try again shortly after the pending obstacle passes.
          s.nextPacketDist = s.nextObstacleDist + PACKET_CLEARANCE + 60;
        }
      }

      // Player AABB in stage coords.
      const ph = s.sliding ? PLAYER_H_SLIDE : PLAYER_H;
      const pxL = PLAYER_X;
      const pxR = PLAYER_X + PLAYER_W;
      const pyB = s.playerY;
      const pyT = s.playerY + ph;

      for (const o of s.obstacles) {
        const oB = o.y;
        const oT = o.y + o.h;
        if (pxR > o.x && pxL < o.x + o.w && pyT > oB && pyB < oT) {
          o.hit = true;
          handoff = 'over';
          break;
        }
      }

      if (!handoff) {
        for (const p of s.packets) {
          if (p.collected) continue;
          const pB = p.y;
          const pT = p.y + p.h;
          if (pxR > p.x && pxL < p.x + p.w && pyT > pB && pyB < pT) {
            p.collected = true;
            s.score += 1;
          }
        }
        s.packets = s.packets.filter((p) => !p.collected);
      }

      tick();

      if (handoff === 'over') {
        alive = false;
        endGame();
        return;
      }
      requestAnimationFrame(step);
    };

    const rafId = requestAnimationFrame(step);
    return () => {
      alive = false;
      cancelAnimationFrame(rafId);
    };
  }, [gameState]);

  // Input — jump on space/↑/w keydown; slide is HELD via ↓/s. The
  // physics loop watches `slideHeld` and translates hold + ground state
  // into an actual slide, so a mid-air ↓ correctly triggers an auto-slide
  // the instant the player lands.
  useEffect(() => {
    const isJump = (k) => k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W';
    const isSlide = (k) => k === 'ArrowDown' || k === 's' || k === 'S';
    const jump = () => {
      const s = stateRef.current;
      if (s.playerY === 0 && !s.sliding) s.vy = JUMP_VY;
    };
    const onKeyDown = (e) => {
      if (gameState === 'menu' && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        start();
        return;
      }
      if (gameState !== 'playing') return;
      if (isJump(e.key)) {
        e.preventDefault();
        if (e.repeat) return;
        jump();
      } else if (isSlide(e.key)) {
        e.preventDefault();
        stateRef.current.slideHeld = true;
      }
    };
    const onKeyUp = (e) => {
      if (isSlide(e.key)) {
        stateRef.current.slideHeld = false;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [gameState]);

  // Touch handlers — jump is a tap; slide is hold-to-slide via
  // press-and-release. Also handle touchcancel/mouseleave so a slide
  // doesn't stick if the finger slides off the button.
  const handleJumpDown = (e) => {
    e.preventDefault();
    const s = stateRef.current;
    if (gameState === 'playing' && s.playerY === 0 && !s.sliding) s.vy = JUMP_VY;
  };
  const handleSlideDown = (e) => {
    e.preventDefault();
    if (gameState === 'playing') stateRef.current.slideHeld = true;
  };
  const handleSlideUp = (e) => {
    e.preventDefault();
    stateRef.current.slideHeld = false;
  };

  const renderStage = () => {
    const s = stateRef.current;
    const ph = s.sliding ? PLAYER_H_SLIDE : PLAYER_H;
    const glyph = s.sliding ? '=' : '>';
    return (
      <div
        className="nr-stage"
        style={{ '--stage-w': `${WORLD_W}px`, '--stage-h': `${WORLD_H}px` }}
      >
        <div className="nr-scan" aria-hidden="true" />
        <div className="nr-grid" aria-hidden="true" />
        <div className="nr-ground" style={{ bottom: GROUND_Y - 2 }} aria-hidden="true" />

        {s.obstacles.map((o, i) => (
          <div
            key={`o${i}`}
            className={`nr-obstacle nr-obstacle--${o.type}`}
            style={{
              left: o.x,
              bottom: GROUND_Y + o.y,
              width: o.w,
              height: o.h,
            }}
          >
            {o.char}
          </div>
        ))}
        {s.packets.map((p, i) => (
          <div
            key={`p${i}`}
            className="nr-packet"
            style={{
              left: p.x,
              bottom: GROUND_Y + p.y,
              width: p.w,
              height: p.h,
            }}
          >
            ◆
          </div>
        ))}

        <div
          className={`nr-player ${s.sliding ? 'nr-player--slide' : ''}`}
          style={{
            left: PLAYER_X,
            bottom: GROUND_Y + s.playerY,
            width: PLAYER_W,
            height: ph,
          }}
        >
          {glyph}
        </div>

        <div className="nr-hud">
          <span className="nr-hud-stat">DIST {distanceToMeters(s.distance).toString().padStart(6, '0')}m</span>
          <span className="nr-hud-stat">PKT {s.score.toString().padStart(3, '0')}</span>
          <span className="nr-hud-stat">DOD {s.dodges.toString().padStart(3, '0')}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="node-runner-container hud-skin">
      <div className="node-runner-modal">
        <div className="modal-header">
          <span className="nr-header-tag" aria-hidden="true">DAT.03</span>
          <h2>NODE_RUNNER v1.0</h2>
          <button className="close-btn" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="modal-body">
          {gameState === 'menu' && (
            <div className="node-runner-menu">
              <div className="menu-header">
                <h2 className="glitch-text" data-text="NODE_RUNNER">NODE_RUNNER</h2>
                <p className="menu-subtitle">Terminal Sprint Protocol</p>
              </div>
              <div className="game-description">
                <p><strong>Mission:</strong> Sprint the endless daemon. Outrun the trace.</p>
                <p><strong>Controls:</strong> SPACE / ↑ jump &nbsp;|&nbsp; ↓ slide</p>
                <p><strong>Hazards:</strong> ▓ firewall · ▲ null spike · ║ scan beam <span className="nr-pt">(slide!)</span> · ▒ corrupted sector</p>
                <p><strong>Collect:</strong> ◆ data packet <span className="nr-pt">(+1)</span></p>
                <p><strong>Win Condition:</strong> None. Only distance, only precision.</p>
              </div>
              <button className="start-btn" onClick={start}>INITIATE SPRINT</button>
              <div className="high-scores">
                <h3>Command Log Archive</h3>
                <div className="scores-list">
                  {scores.length === 0 && (
                    <div className="nr-empty-log">// archive empty — set a baseline</div>
                  )}
                  {scores.slice(0, 5).map((row, i) => (
                    <div key={i} className="score-entry nr-score-entry">
                      <span className="score-rank">#{i + 1}</span>
                      <span className="nr-score-dist">{row.distance}m</span>
                      <span className="nr-score-packets">◆ {row.packets}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="node-runner-countdown">
              <div className="countdown-display">
                <h2 className="countdown-number">{countdown}</h2>
                <p className="countdown-text">SPRINT INIT</p>
              </div>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              {renderStage()}
              <div className="nr-mobile-controls">
                <button
                  className="nr-touch nr-touch--jump"
                  onTouchStart={handleJumpDown}
                  onMouseDown={handleJumpDown}
                  aria-label="Jump"
                >
                  ↑ JUMP
                </button>
                <button
                  className="nr-touch nr-touch--slide"
                  onTouchStart={handleSlideDown}
                  onTouchEnd={handleSlideUp}
                  onTouchCancel={handleSlideUp}
                  onMouseDown={handleSlideDown}
                  onMouseUp={handleSlideUp}
                  onMouseLeave={handleSlideUp}
                  aria-label="Slide"
                >
                  ↓ SLIDE
                </button>
              </div>
            </>
          )}

          {gameState === 'over' && (
            <div className="node-runner-gameover">
              <div className="gameover-header">
                <h2 className="glitch-text critical" data-text="PROCESS TERMINATED">
                  PROCESS TERMINATED
                </h2>
                <p className="detection-message">Trace complete. Session halted.</p>

                <div className="flickering-log">
                  <p>=== COMMAND LOG ARCHIVE ===</p>
                  <p>Distance Covered: {finalStats?.distance ?? 0}m</p>
                  <p>Successful Dodges: {finalStats?.dodges ?? 0}</p>
                  <p>Data Packets Collected: {finalStats?.packets ?? 0}</p>
                  <p>Status: PROCESS HALTED</p>
                  <p>=== END LOG ===</p>
                </div>
              </div>
              <div className="gameover-actions">
                <button className="retry-btn" onClick={start}>RESTART SPRINT</button>
                <button className="menu-btn" onClick={() => setGameState('menu')}>RETURN TO MENU</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
