import { useEffect, useMemo, useState } from 'react';
import './WoundHUD.css';

// Anatomy anchor glyphs — drawn as thin technical strokes so they read
// engineered (Cyberpunk 2077 diegetic) rather than iconographic.
const AnchorGlyph = ({ kind }) => {
  const props = { className: 'glyph', vectorEffect: 'non-scaling-stroke', strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (kind) {
    case 'crown':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M2 18 L4 8 L7 14 L11 6 L15 14 L18 8 L20 18 Z" {...props} />
          <line x1="4" y1="18" x2="18" y2="18" {...props} />
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M11 18 C4 13 3 8 6 6 C8 4.5 10 6 11 8 C12 6 14 4.5 16 6 C19 8 18 13 11 18 Z" {...props} />
        </svg>
      );
    case 'eyes':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M2 11 C6 5 16 5 20 11 C16 17 6 17 2 11 Z" {...props} />
          <circle cx="11" cy="11" r="2.5" {...props} />
          <circle cx="11" cy="11" r="0.6" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'spine':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <line x1="11" y1="2" x2="11" y2="20" {...props} />
          <line x1="7" y1="5" x2="15" y2="5" {...props} />
          <line x1="7" y1="9" x2="15" y2="9" {...props} />
          <line x1="7" y1="13" x2="15" y2="13" {...props} />
          <line x1="7" y1="17" x2="15" y2="17" {...props} />
        </svg>
      );
    case 'blood':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M11 2 C5 10 5 14 8 17 C11 20 14 17 14 14 C14 10 11 8 11 2 Z" {...props} />
        </svg>
      );
    case 'womb':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M4 10 L6 6 L11 4 L16 6 L18 10 L16 18 L6 18 Z" {...props} />
          <line x1="11" y1="4" x2="11" y2="10" {...props} />
        </svg>
      );
    case 'tongue':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M4 8 C8 4 14 4 18 8 L11 20 Z" {...props} />
          <line x1="11" y1="9" x2="11" y2="17" {...props} />
        </svg>
      );
    case 'nerves':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <path d="M2 11 L6 8 L10 11 L14 8 L18 11" {...props} />
          <path d="M2 11 L6 14 L10 11 L14 14 L18 11" {...props} />
          <circle cx="11" cy="11" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case 'skin':
      return (
        <svg viewBox="0 0 22 22" aria-hidden="true">
          <circle cx="11" cy="11" r="8" {...props} />
          <circle cx="11" cy="11" r="5" {...props} />
        </svg>
      );
    default:
      return null;
  }
};

const ANCHORS_BY_VARIANT = {
  calls: [
    { kind: 'tongue', name: 'Tongue', mode: 'EXECUTE +1' },
    { kind: 'nerves', name: 'Nerves', mode: 'ROUTE 00' },
    { kind: 'skin',   name: 'Skin',   mode: 'HANDSHAKE +1' },
  ],
  transactions: [
    { kind: 'blood', name: 'Blood', mode: 'FLOW +1' },
    { kind: 'womb',  name: 'Womb',  mode: 'PROVISION 00' },
    { kind: 'spine', name: 'Spine', mode: 'CONTINUITY 00' },
  ],
  operating: [
    { kind: 'eyes',  name: 'Eyes',  mode: 'PERCEPT +1' },
    { kind: 'crown', name: 'Crown', mode: 'AUTHOR 00' },
    { kind: 'heart', name: 'Heart', mode: 'INTENT +1' },
  ],
};

const ALL_ANCHORS = ['tongue', 'nerves', 'skin', 'blood', 'womb', 'spine', 'eyes', 'crown', 'heart'];

// -----------------------------------------------------------------------------
// Quickhack menu — a CP2077-style hack palette re-fitted for the Wound. Each
// entry either denies (locks) or grants (spoofs) access to a wound-bonded
// device: weapons, cyberware, transit tokens, kill switches. Cost is in RAM
// (a proxy for cognitive runtime the Levy is already taxing).
// -----------------------------------------------------------------------------
const QUICKHACKS = [
  { id: 'deny-firearm',   name: 'Firearm · Deny',        desc: 'strip trigger permission on bonded weapon', cost: 4, state: 'ready',     iconD: 'M2 12 L18 12 L18 8 L20 10 L18 12 L22 12 M6 12 L6 16' },
  { id: 'deny-cyber',     name: 'Cyberware · Deny',      desc: 'refuse render for arm-implant kinetics',    cost: 6, state: 'ready',     iconD: 'M4 12 L10 12 M14 12 L20 12 M10 6 L14 6 L14 18 L10 18 Z M12 4 L12 6 M12 18 L12 20' },
  { id: 'grant-transit',  name: 'Transit · Grant',       desc: 'spoof strata-04 access for one crossing',  cost: 3, state: 'ready',     iconD: 'M4 6 L20 6 L20 16 L4 16 Z M4 10 L20 10 M7 16 L7 20 M17 16 L17 20' },
  { id: 'deny-door',      name: 'Door · Deny',           desc: 'freeze bastion elevator on approach',       cost: 5, state: 'uploading', iconD: 'M6 3 L18 3 L18 21 L6 21 Z M15 12 L15 14' },
  { id: 'wipe-provenance', name: 'Provenance · Wipe',    desc: 'scrub R-class chain-of-custody trace',      cost: 8, state: 'locked',    iconD: 'M4 8 L20 8 L18 20 L6 20 Z M9 4 L15 4 L15 8 L9 8 Z M10 12 L10 17 M14 12 L14 17' },
  { id: 'grant-veins',    name: 'Veins · Grant',         desc: 'route sublimated payment through backer',   cost: 4, state: 'ready',     iconD: 'M4 12 C8 6, 12 6, 12 12 C12 18, 16 18, 20 12' },
  { id: 'blind-witness',  name: 'Witness · Blind',       desc: 'desat the trace bloom watching sector 3-B', cost: 7, state: 'ready',     iconD: 'M2 12 C6 6, 18 6, 22 12 C18 18, 6 18, 2 12 Z M12 9 L12 15 M8 8 L16 16' },
  { id: 'kill-switch',    name: 'Kill-Switch · Arm',     desc: 'wound-bonded shutdown, primarch consent',   cost: 10, state: 'locked',   iconD: 'M12 3 L12 12 M6 8 A9 9 0 1 0 18 8' },
];

// Everyday buys routed through the Wound — coffee, transit, rent-a-body, the
// mundane surface of digital-vampirism. Recent history + one pending prompt.
const RECENT_BUYS = [
  { id: 't-01', name: 'Cassia · Coffee',    meta: 'strata 04 · trench cart',  amt: '¥ 12',   state: 'sealed',   iconD: 'M4 8 L18 8 L18 16 A4 4 0 0 1 14 20 L8 20 A4 4 0 0 1 4 16 Z M18 10 L20 10 A2 2 0 0 1 20 14 L18 14' },
  { id: 't-02', name: 'Transit · L3-Bastion', meta: 'crossing pass · 1x',      amt: '¥ 46',   state: 'sealed',   iconD: 'M4 6 L20 6 L20 16 L4 16 Z M4 10 L20 10 M7 16 L7 20 M17 16 L17 20' },
  { id: 't-03', name: 'Rent-a-body · 20m',  meta: 'strata 06 · courier skin', amt: '¥ 210',  state: 'declined', iconD: 'M12 4 A4 4 0 1 1 12 12 A4 4 0 1 1 12 4 Z M4 20 C4 15 8 13 12 13 C16 13 20 15 20 20' },
  { id: 't-04', name: 'Ghostline · relay',  meta: 'nerves route · 4 min',     amt: '¥ 18',   state: 'sealed',   iconD: 'M2 11 L6 8 L10 11 L14 8 L18 11 L22 8' },
  { id: 't-05', name: 'Bastion · light meal', meta: 'primarch-tier · lvl 07', amt: '¥ 88',   state: 'sealed',   iconD: 'M4 12 L20 12 M4 14 L20 14 L18 20 L6 20 Z M8 8 L8 12 M12 6 L12 12 M16 8 L16 12' },
];

// Portrait wireframe for the Calls canvas.
function FaceWire() {
  return (
    <svg viewBox="0 0 200 240" preserveAspectRatio="xMidYMid meet">
      <path className="face-line" d="M55 90 C55 40 145 40 145 90 C145 150 130 200 100 210 C70 200 55 150 55 90 Z" />
      <path className="face-line" d="M70 105 C78 100 92 100 100 108" />
      <path className="face-line" d="M100 108 C108 100 122 100 130 105" />
      <ellipse className="face-line" cx="82" cy="115" rx="8" ry="4" />
      <ellipse className="face-line" cx="118" cy="115" rx="8" ry="4" />
      <line className="face-line" x1="100" y1="115" x2="100" y2="150" />
      <path className="face-line" d="M92 155 C96 160 104 160 108 155" />
      <path className="face-line" d="M80 180 C90 190 110 190 120 180" />
      <path className="face-line" d="M55 90 L40 130 L55 145" />
      <path className="face-line" d="M145 90 L160 130 L145 145" />
      <line className="face-line" x1="100" y1="30" x2="100" y2="220" strokeOpacity="0.25" strokeDasharray="2 4" />
      <line className="face-line" x1="40" y1="120" x2="160" y2="120" strokeOpacity="0.25" strokeDasharray="2 4" />
    </svg>
  );
}

// Arterial vein network for the Transactions canvas.
function VeinNetwork() {
  return (
    <svg viewBox="0 0 600 220" preserveAspectRatio="none">
      <path className="vein" d="M20 44 C120 30, 240 90, 340 80 C440 70, 520 110, 580 100" />
      <path className="vein" d="M20 110 C140 120, 260 60, 360 100 C460 140, 520 90, 580 130" />
      <path className="vein vein--dim" d="M20 176 C140 160, 260 190, 360 160 C460 130, 520 190, 580 170" />
      <circle className="node" cx="80" cy="52" r="3" />
      <circle className="node" cx="340" cy="80" r="4" />
      <circle className="node" cx="480" cy="105" r="3.5" />
      <circle className="node" cx="240" cy="88" r="3" style={{ animationDelay: '0.4s' }} />
    </svg>
  );
}

// Deterministic pseudo-random waveform. Same seed = same shape; used for the
// telemetry sparklines so they render identically across refreshes.
function Waveform({ points = 32, seed = 1, red = false, amp = 0.7 }) {
  const pts = useMemo(() => {
    const arr = [];
    for (let i = 0; i < points; i += 1) {
      const t = i / (points - 1);
      const y = 0.5
        + Math.sin(t * 6 + seed) * 0.28 * amp
        + Math.sin(t * 17 + seed * 2.3) * 0.14 * amp
        + Math.cos(t * 3.4 + seed) * 0.06 * amp;
      arr.push([t * 100, (1 - Math.max(0.05, Math.min(0.95, y))) * 40]);
    }
    return arr;
  }, [points, seed, amp]);
  const d = pts.reduce((acc, [x, y], i) => acc + (i === 0 ? `M${x} ${y}` : ` L${x} ${y}`), '');
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none">
      <path className={`wave-line${red ? ' wave-line--red' : ''}`} d={d} />
    </svg>
  );
}

export default function WoundHUD() {
  const [variant, setVariant] = useState('calls');
  // Handshake state on the Calls variant — pending (jittered, red) or sealed
  // (locked, gold). Toggle sits on the canvas so the user can flip between
  // "incoming call, not yet consented" and "call accepted, both parties
  // consented — membrane is now a contract".
  const [handshake, setHandshake] = useState('pending');

  // Levy meter — the interface feeds on attention. Ticks and drifts.
  const [levy, setLevy] = useState(42);
  useEffect(() => {
    const id = setInterval(() => {
      setLevy((prev) => {
        const drift = (Math.sin(prev * 0.7) + 1) * 0.7;
        const next = prev + drift;
        return next > 92 ? 34 : next;
      });
    }, 1400);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    setLevy((prev) => Math.max(30, prev - 6));
  }, [variant]);

  // Live clock — real system time, updated every second. Reinforces the
  // "you are being watched right now" feel without adding server dep.
  const [clock, setClock] = useState('--:--:--');
  useEffect(() => {
    const format = () => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, '0');
      setClock(`${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`);
    };
    format();
    const id = setInterval(format, 1000);
    return () => clearInterval(id);
  }, []);

  const anchors = ANCHORS_BY_VARIANT[variant];

  const faceStack = useMemo(() => (
    <>
      <FaceWire />
      <div className="wound-face-ghost-r"><FaceWire /></div>
      <div className="wound-face-ghost-c"><FaceWire /></div>
    </>
  ), []);

  return (
    <div className="wound-hud" data-variant={variant}>
      <div className="whud-grain" aria-hidden="true" />
      <div className="wound-frame" aria-hidden="true">
        <span className="wound-frame-corner wound-frame-corner--tl" />
        <span className="wound-frame-corner wound-frame-corner--tr" />
        <span className="wound-frame-corner wound-frame-corner--bl" />
        <span className="wound-frame-corner wound-frame-corner--br" />
      </div>

      {/* --- Top strip ------------------------------------------------- */}
      <header className="wound-top">
        <div className="wound-idline">
          <div className="wound-idline-l1">
            <span className="whud-glyph-mark" aria-hidden="true" />
            The Wound
            <span className="wound-idline-l1-italic">render-layer · v7.1</span>
          </div>
          <div className="wound-idline-l2">
            <span className="whud-kv"><span className="whud-kv-key">OBSERVER</span> <span className="whud-kv-val">LUKE.P</span></span>
            <span className="whud-kv"><span className="whud-kv-key">STRATA</span> <span className="whud-kv-val">07 / BASTION</span></span>
            <span className="whud-kv"><span className="whud-kv-key">PATCH</span> <span className="whud-kv-val whud-kv-val--warn">SEAM-OPEN</span></span>
            <span className="whud-kv"><span className="whud-kv-key">CLOCK</span> <span className="whud-kv-val">{clock}</span></span>
          </div>
        </div>
        <div className="wound-levy" aria-label="Attention levy meter">
          <div className="wound-levy-label">
            <span>LEVY · ARTERIAL</span>
            <span>{Math.round(levy)}%</span>
          </div>
          <div className="wound-levy-bar">
            <div className="wound-levy-fill" style={{ width: `${Math.min(100, Math.max(0, levy))}%` }} />
          </div>
          <div className="wound-levy-nums">
            <span>RUNTIME LEASED</span>
            <span><b>{Math.round(levy * 12.4).toLocaleString()}</b> HZ</span>
          </div>
        </div>
      </header>

      {/* Degradation chips: the five documented failure modes always visible
          so the reader can watch the render layer decay in real time. */}
      <div className="wound-degrade" aria-label="Degradation states">
        <span className="wound-degrade-label">RENDER · DEGRADE</span>
        <span className="wound-degrade-chip is-red"><b>DESAT</b> −17%</span>
        <span className="wound-degrade-chip is-red"><b>SYNC-LAG</b> +41ms</span>
        <span className="wound-degrade-chip is-gold"><b>CONSENT</b> 3 QUEUED</span>
        <span className="wound-degrade-chip is-red"><b>TRACE BLOOM</b> +2</span>
        <span className="wound-degrade-chip is-cyan"><b>DRIFT</b> LOW</span>
        <span className="wound-degrade-chip is-cyan"><b>CLEAN MODE</b> OFF</span>
      </div>

      {/* --- Variant switcher ---------------------------------------- */}
      <nav className="wound-variants" role="tablist" aria-label="HUD variants">
        {[
          { id: 'calls', label: 'Calls', num: '01' },
          { id: 'transactions', label: 'Transactions', num: '02' },
          { id: 'operating', label: 'Wound-Operating', num: '03' },
        ].map((v) => (
          <button
            key={v.id}
            role="tab"
            type="button"
            className="wound-variant"
            aria-selected={variant === v.id}
            onClick={() => setVariant(v.id)}
          >
            <span className="wound-variant-num">{v.num}</span>
            {v.label}
          </button>
        ))}
      </nav>

      {/* --- Body: anchors | canvas | telemetry ---------------------- */}
      <div className="wound-body">
        <aside className="wound-anchors" aria-label="Anatomy anchors">
          <div className="wound-anchors-head">
            <span>Anchors</span>
            <span className="wound-anchors-head-count">{anchors.length} / {ALL_ANCHORS.length} LIT</span>
          </div>
          {anchors.map((a) => (
            <div key={a.kind} className="wound-anchor wound-anchor--lit">
              <AnchorGlyph kind={a.kind} />
              <div className="wound-anchor-name">{a.name}</div>
              <div className="wound-anchor-mode">{a.mode}</div>
            </div>
          ))}
          {ALL_ANCHORS.filter((k) => !anchors.some((a) => a.kind === k)).map((k) => (
            <div key={k} className="wound-anchor">
              <AnchorGlyph kind={k} />
              <div className="wound-anchor-name">{k}</div>
              <div className="wound-anchor-mode">DORMANT</div>
            </div>
          ))}
        </aside>

        <section className="wound-canvas">
          <div className="wound-canvas-head">
            <div>
              <div className="wound-canvas-title">
                {variant === 'calls' && 'Comms · Handshake'}
                {variant === 'transactions' && 'Provenance · Ledger'}
                {variant === 'operating' && 'Wound · Operating'}
              </div>
              <div className="wound-canvas-subtitle">
                {variant === 'calls' && 'tongue · nerves · skin — ghostline static'}
                {variant === 'transactions' && 'blood · womb · spine — R-class custody sealed'}
                {variant === 'operating' && 'eyes · crown · heart — thin terrain, seams exposed'}
              </div>
            </div>
            <div className={`wound-canvas-status ${
              variant === 'operating' ? 'wound-canvas-status--warn' :
              variant === 'calls' && handshake === 'pending' ? 'wound-canvas-status--warn' : ''
            }`}>
              {variant === 'calls' && (handshake === 'sealed' ? 'HANDSHAKE SEALED' : 'CONSENT PENDING')}
              {variant === 'transactions' && 'CUSTODY OK'}
              {variant === 'operating' && 'ANOMALY LIVE'}
            </div>
          </div>

          {variant === 'calls' && (
            <div className="wound-calls-body">
              <div className="wound-calls-state-toggle" role="tablist" aria-label="Handshake state">
                <button
                  type="button"
                  className={handshake === 'pending' ? 'is-on' : ''}
                  data-state="pending"
                  onClick={() => setHandshake('pending')}
                >PENDING</button>
                <button
                  type="button"
                  className={handshake === 'sealed' ? 'is-on' : ''}
                  data-state="sealed"
                  onClick={() => setHandshake('sealed')}
                >SEALED</button>
              </div>
              <div className="wound-face" data-state={handshake}>
                <span className="wound-face-corner wound-face-corner--tl" />
                <span className="wound-face-corner wound-face-corner--tr" />
                <span className="wound-face-corner wound-face-corner--bl" />
                <span className="wound-face-corner wound-face-corner--br" />
                {faceStack}
                <div className="wound-face-membrane" />
                <div className="wound-face-scan" />
                {handshake === 'sealed' && (
                  <div className="wound-face-stamp">
                    CONSENT SEALED
                    <small>membrane · gold · primarch witness</small>
                  </div>
                )}
                <div className="wound-face-label">
                  <span>ID · 04-CR</span>
                  <span>{handshake === 'sealed' ? 'RESOLVED · 1.00' : 'JITTER +2'}</span>
                </div>
              </div>
              <div className="wound-calls-details">
                <div>
                  <div className="wound-calls-name">Cassia Renwick</div>
                  <div className="wound-calls-name-sub">
                    {handshake === 'sealed'
                      ? 'strata 04 · trench relay · bonded'
                      : 'strata 04 · trench relay'}
                  </div>
                </div>
                <div className="wound-calls-tags">
                  <span className="wound-calls-tag">GHOSTLINE</span>
                  {handshake === 'sealed' ? (
                    <>
                      <span className="wound-calls-tag" style={{ color: '#f0c064', borderColor: 'rgba(240,192,100,0.5)', background: 'rgba(240,192,100,0.08)' }}>CONSENT · SEALED</span>
                      <span className="wound-calls-tag">TRUST 0.94</span>
                      <span className="wound-calls-tag">DURATION 00:12</span>
                    </>
                  ) : (
                    <>
                      <span className="wound-calls-tag wound-calls-tag--hot">CONSENT · PENDING</span>
                      <span className="wound-calls-tag">TRUST 0.62</span>
                    </>
                  )}
                </div>
                <div className="wound-calls-rows">
                  <div className="wound-calls-row"><span>ROUTE</span><b>NERVES // C-04</b></div>
                  <div className="wound-calls-row"><span>LATENCY</span><b>{handshake === 'sealed' ? '18 MS' : '41 MS'}</b></div>
                  <div className={`wound-calls-row${handshake === 'pending' ? ' is-hot' : ''}`}>
                    <span>IDENTITY</span>
                    <b>{handshake === 'sealed' ? 'RESOLVED · CHECKSUM ✓' : 'JITTER · +2'}</b>
                  </div>
                  <div className="wound-calls-row"><span>MEMBRANE</span><b>{handshake === 'sealed' ? 'SKIN · LOCKED · GOLD' : 'SKIN +1'}</b></div>
                  <div className="wound-calls-row"><span>PROTOCOL</span><b>TONGUE / EXEC</b></div>
                </div>
                <div className="wound-calls-actions">
                  {handshake === 'sealed' ? (
                    <>
                      <button className="wound-calls-btn" type="button">MUTE</button>
                      <button className="wound-calls-btn wound-calls-btn--danger" type="button" onClick={() => setHandshake('pending')}>END</button>
                    </>
                  ) : (
                    <>
                      <button className="wound-calls-btn" type="button" onClick={() => setHandshake('sealed')}>ACCEPT · SEAL</button>
                      <button className="wound-calls-btn wound-calls-btn--danger" type="button">SEVER</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {variant === 'transactions' && (
            <>
              <div className="wound-tx-veins">
                <VeinNetwork />
                <div className="wound-tx-nodelabels">
                  <div className="wound-tx-nodelabel" style={{ top: '12%', left: '8%' }}>ORIGIN · <b>T-04</b></div>
                  <div className="wound-tx-nodelabel" style={{ top: '30%', left: '52%' }}>WOMB · <b>B-L3</b></div>
                  <div className="wound-tx-nodelabel" style={{ bottom: '14%', right: '10%' }}>SEAL · <b>PRIMARCH</b></div>
                </div>
              </div>

              <div className="wound-tx-receipt">
                <div className="wound-tx-seal">R3</div>
                <div className="wound-tx-receipt-meta">
                  <b>Receipt R-3 · Blood-Borne</b>
                  <span>CIRCULATION · <code>VERIFIED</code> · LEVY REMIT · 4.2%</span>
                  <span>TX · <code>0xAC1B · 7F80 · DC44 · 019E</code></span>
                </div>
                <div className="wound-tx-receipt-state">
                  <span>STATE</span>
                  <b>SEALED</b>
                  <span>{clock}</span>
                </div>
              </div>

              <div className="wound-tx-ledger">
                <div className="wound-tx-ledger-cell"><span className="k">FLOW △</span><span className="v">1,204</span></div>
                <div className="wound-tx-ledger-cell wound-tx-ledger-cell--hot"><span className="k">LEVY ▼</span><span className="v">51</span></div>
                <div className="wound-tx-ledger-cell wound-tx-ledger-cell--cyan"><span className="k">NET =</span><span className="v">1,153</span></div>
                <div className="wound-tx-ledger-cell"><span className="k">SEAL R</span><span className="v">03/05</span></div>
              </div>

              {/* Everyday-purchase panel: recent buys + one pending prompt. Mundane
                  transactions routed through the same veins as R-class transfers. */}
              <div className="wound-buy">
                <div className="wound-buy-recent">
                  <div className="wound-buy-head">Recent · Point-of-Sale <b>05 · TODAY</b></div>
                  {RECENT_BUYS.map((buy) => (
                    <div key={buy.id} className={`wound-buy-row is-${buy.state}`}>
                      <span className="wound-buy-row-icon" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d={buy.iconD} /></svg>
                      </span>
                      <div className="wound-buy-row-body">
                        <span className="wound-buy-row-name">{buy.name}</span>
                        <span className="wound-buy-row-meta">{buy.meta}</span>
                      </div>
                      <span className="wound-buy-row-amt">{buy.amt}</span>
                      <span className="wound-buy-row-state">{buy.state}</span>
                    </div>
                  ))}
                </div>

                <div className="wound-buy-pending">
                  <div className="wound-buy-head">Pending · Consent required</div>
                  <div className="wound-buy-pending-card">
                    <div className="wound-buy-vendor">
                      <div>
                        <div className="wound-buy-vendor-name">Bastion · Nightbar</div>
                        <div className="wound-buy-vendor-sub">strata 07 · reliquary lounge</div>
                      </div>
                      <div className="wound-buy-vendor-tier">TIER 07 · GOLD</div>
                    </div>
                    <div className="wound-buy-line"><span>ITEM · Cocaine chic · 0.4g</span><b>¥ 640</b></div>
                    <div className="wound-buy-line"><span>SERVICE · Attend · primarch skin</span><b>¥ 120</b></div>
                    <div className="wound-buy-line is-levy"><span>LEVY · +4.2%</span><b>¥ 32</b></div>
                    <div className="wound-buy-line is-total"><span>TOTAL</span><b>¥ 792</b></div>
                    <div className="wound-buy-actions">
                      <button className="wound-buy-btn" type="button">CONSENT · SEAL</button>
                      <button className="wound-buy-btn wound-buy-btn--danger" type="button">DENY</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {variant === 'operating' && (
            <>
              <div className="wound-op-scene">
                <div className="wound-op-horizon" />
                <div className="wound-op-bloom" />
                <div className="wound-op-target">
                  <div className="wound-op-target-ring" />
                  <div className="wound-op-target-tag">TRACE +2</div>
                </div>
                <div className="wound-op-hud-corners" aria-hidden="true">
                  <span /><span /><span /><span />
                </div>
                <div className="wound-op-hud-coord">GRID <b>03-B · 271, 042</b></div>
                <div className="wound-op-hud-strata">STRATA <b>07</b></div>
              </div>

              <div className="wound-op-flags">
                <div className="wound-op-flag">
                  <span className="wound-op-flag-tag">ANOMALY</span>
                  <span className="wound-op-flag-msg">TRACE BLOOM · SECTOR 3-B · +2 WITNESSES</span>
                  <span className="wound-op-flag-ts">{clock}</span>
                  <span className="wound-op-flag-id">#A-2211</span>
                </div>
                <div className="wound-op-flag wound-op-flag--warn">
                  <span className="wound-op-flag-tag">SEAM</span>
                  <span className="wound-op-flag-msg">PATCH DEGRADE · DESAT RISING · RE-RENDER ADVISED</span>
                  <span className="wound-op-flag-ts">14:22:03</span>
                  <span className="wound-op-flag-id">#S-0447</span>
                </div>
                <div className="wound-op-flag wound-op-flag--info">
                  <span className="wound-op-flag-tag">DRIFT</span>
                  <span className="wound-op-flag-msg">AFTERIMAGE PRESSURE · LOW · NOMINAL FOR STRATA</span>
                  <span className="wound-op-flag-ts">14:21:44</span>
                  <span className="wound-op-flag-id">#D-0138</span>
                </div>
              </div>

              {/* Quickhack menu: left column reads the current target (a bonded
                  weapon/cyberware/kill-switch entity), right column is the hack
                  palette Luke can deploy against it. RAM cells at bottom-left
                  visualize which portion of runtime is already leased vs queued
                  for the next upload. */}
              <div className="wound-qh" aria-label="Quickhack menu">
                <aside className="wound-qh-entity">
                  <div className="wound-qh-entity-head">TARGET · WOUND-BONDED</div>
                  <div className="wound-qh-entity-id">#T-3B-04 · TRENCH RELAY · 271m</div>
                  <div className="wound-qh-entity-name">Militech · Kanzō 7mm</div>
                  <div className="wound-qh-entity-sub">bonded firearm · strata 04</div>
                  <div className="wound-qh-entity-rows">
                    <div className="wound-qh-entity-row"><span>OWNER</span><b>C. RENWICK</b></div>
                    <div className="wound-qh-entity-row is-cyan"><span>SEAL</span><b>R-2 · TRIGGER</b></div>
                    <div className="wound-qh-entity-row is-hot"><span>STATE</span><b>ARMED · UNLOCKED</b></div>
                    <div className="wound-qh-entity-row"><span>UPLINK</span><b>NERVES // C-04</b></div>
                    <div className="wound-qh-entity-row"><span>PATCH</span><b>SEAM · OPEN</b></div>
                  </div>
                  <div className="wound-qh-ram">
                    <div className="wound-qh-ram-head"><span>RAM · LEASED</span><b>7 / 12</b></div>
                    <div className="wound-qh-ram-cells" aria-hidden="true">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <span
                          key={i}
                          className={`wound-qh-ram-cell${i < 7 ? ' is-on' : i < 9 ? ' is-queued' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="wound-qh-list" role="list">
                  <div className="wound-qh-list-head">
                    <span>UPLOAD · <b>NERVES // C-04</b></span>
                    <span>8 HACKS AVAILABLE</span>
                  </div>
                  {QUICKHACKS.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      role="listitem"
                      className="wound-qh-item"
                      data-locked={h.state === 'locked'}
                      data-active={h.state === 'uploading'}
                      data-state={h.state}
                    >
                      <span className="wound-qh-item-glyph" aria-hidden="true">
                        <svg viewBox="0 0 24 24"><path d={h.iconD} /></svg>
                      </span>
                      <span className="wound-qh-item-body">
                        <span className="wound-qh-item-name">{h.name}</span>
                        <span className="wound-qh-item-desc">{h.desc}</span>
                      </span>
                      <span className="wound-qh-item-cost">{h.cost} RAM</span>
                      <span className="wound-qh-item-state">
                        {h.state === 'uploading' && '↑ 62%'}
                        {h.state === 'ready'     && 'READY'}
                        {h.state === 'locked'    && 'LOCKED'}
                        {h.state === 'applied'   && 'APPLIED'}
                      </span>
                      {h.state === 'uploading' && <span className="wound-qh-item-progress" aria-hidden="true" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>

        <aside className="wound-telemetry" aria-label="Telemetry">
          <div className="wound-tm-block">
            <div className="wound-tm-head"><span>Perception</span><span className="wound-tm-head-sub">0.94 SYNC</span></div>
            <div className="wound-tm-row"><span>sync</span><b>0.94</b></div>
            <div className="wound-tm-row wound-tm-row--red"><span>desat</span><b>−17%</b></div>
            <div className="wound-tm-row"><span>bloom</span><b>+3</b></div>
            <div className="wound-tm-row wound-tm-row--cyan"><span>consent</span><b>held</b></div>
          </div>

          <div className="wound-tm-block">
            <div className="wound-tm-head"><span>Tier</span><span className="wound-tm-head-sub">STRATA 07</span></div>
            <div className="wound-tm-tiers">
              <span className="wound-tm-tier is-on" />
              <span className="wound-tm-tier is-on" />
              <span className="wound-tm-tier is-on" />
              <span className="wound-tm-tier is-on" />
              <span className="wound-tm-tier is-on" />
              <span className="wound-tm-tier is-on" />
              <span className="wound-tm-tier is-hot" />
              <span className="wound-tm-tier" />
              <span className="wound-tm-tier" />
              <span className="wound-tm-tier" />
            </div>
            <div className="wound-tm-tiers-legend"><span>01</span><b>07 · BASTION</b><span>10</span></div>
          </div>

          <div className="wound-tm-block">
            <div className="wound-tm-head"><span>Ghostline</span><span className="wound-tm-head-sub">4110 PKT</span></div>
            <div className="wound-tm-wave"><Waveform seed={variant === 'calls' ? 2.1 : variant === 'transactions' ? 3.4 : 4.7} /></div>
            <div className="wound-tm-row"><span>packets</span><b>4,110</b></div>
            <div className="wound-tm-row wound-tm-row--red"><span>drop</span><b>0.7%</b></div>
            <div className="wound-tm-row"><span>latency</span><b>41 ms</b></div>
          </div>

          <div className="wound-tm-block">
            <div className="wound-tm-head"><span>Blood</span><span className="wound-tm-head-sub">CIRCULATION</span></div>
            <div className="wound-tm-wave"><Waveform seed={5.1} red amp={0.9} /></div>
            <div className="wound-tm-row"><span>flow</span><b>1.24 L/s</b></div>
            <div className="wound-tm-row wound-tm-row--red"><span>levy</span><b>−4.2%</b></div>
          </div>
        </aside>
      </div>

      {/* --- Codex / legend: explain every element on the HUD in plain terms. --- */}
      <section className="wound-codex" aria-label="Codex">
        <header className="wound-codex-head">
          <div>
            <div className="wound-codex-head-title">Codex · read the render</div>
            <div className="wound-codex-head-sub">every glyph on the wound is either a checksum or a contract</div>
          </div>
          <div className="wound-idline-l2">
            <span className="whud-kv"><span className="whud-kv-key">ENTRIES</span> <span className="whud-kv-val">24</span></span>
            <span className="whud-kv"><span className="whud-kv-key">REV</span> <span className="whud-kv-val">v7.1</span></span>
          </div>
        </header>

        <div className="wound-codex-grid">
          <dl>
            <div className="wound-codex-col-title">Anatomy Anchors</div>
            <div className="wound-codex-entry"><dt className="is-cyan">Crown</dt><dd>authority — permission root, who can lease your runtime.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Heart</dt><dd>intent — the raw wanting driving an action, pre-render.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Eyes</dt><dd>perception — the render layer itself, thin-Wound sight.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Bones</dt><dd>structural continuity — the shape you keep across seams.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Nerves</dt><dd>routing — the pathways calls and hacks travel.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Skin</dt><dd>boundary — where consent handshakes are enforced.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Blood</dt><dd>flow — arterial value + Levy circulation.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Tongue</dt><dd>execute — how instructions leave you and hit the world.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Womb</dt><dd>provision — where new value or code is instantiated.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Spine</dt><dd>continuity — memory of self across resets.</dd></div>
          </dl>

          <dl>
            <div className="wound-codex-col-title">Metering &amp; Contracts</div>
            <div className="wound-codex-entry"><dt className="is-red">Levy</dt><dd>runtime tax — the Wound leases your conscious cycles; the arterial bar is the current draw.</dd></div>
            <div className="wound-codex-entry"><dt className="is-red">RAM</dt><dd>hack runtime budget — one wound-bonded quickhack costs cognitive capacity you could spend elsewhere.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Strata</dt><dd>tier of access — 01 (trench) → 07 (bastion) → primarch kernel.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Membrane</dt><dd>a Skin-anchored boundary contract; must be crossed with consent, otherwise the call is a breach.</dd></div>
            <div className="wound-codex-entry"><dt className="is-gold">Handshake</dt><dd>a comms consent seal. Pending = red / jittered. Sealed = gold / locked / mutual.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">R-Class Receipt</dt><dd>chain-of-custody stamp on a transaction. R0 = anonymous, R5 = primarch-witnessed.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Uplink</dt><dd>the Nerves route currently carrying a hack or a call.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Clean Mode</dt><dd>a minimal-render fallback — Wound strips overlays; useful under duress, expensive to hold.</dd></div>
          </dl>

          <dl>
            <div className="wound-codex-col-title">Degradation States</div>
            <div className="wound-codex-entry"><dt className="is-red">Desat</dt><dd>affect drains toward grey. Emotional throttle, cognitive fatigue, or a failing seam.</dd></div>
            <div className="wound-codex-entry"><dt className="is-red">Sync-Lag</dt><dd>stutter, ghost-doubling, delayed lip-sync. Trust is bleeding.</dd></div>
            <div className="wound-codex-entry"><dt className="is-gold">Consent Flood</dt><dd>too many handshake prompts queued — the interface is asking for more consent than a person can give.</dd></div>
            <div className="wound-codex-entry"><dt className="is-red">Trace Bloom</dt><dd>the render layer is glowing you back at other observers. Every action is being witnessed.</dd></div>
            <div className="wound-codex-entry"><dt className="is-cyan">Drift</dt><dd>afterimage pressure — old renders lingering. Persistent drift = a self-hallucination cost.</dd></div>
          </dl>

          <dl>
            <div className="wound-codex-col-title">Modules on this HUD</div>
            <div className="wound-codex-entry"><dt>Top Strip</dt><dd>observer identity, strata, patch state, live clock, Levy gauge. The rent-meter.</dd></div>
            <div className="wound-codex-entry"><dt>Variant Tabs</dt><dd>Calls / Transactions / Wound-Operating — each surfaces a different anchor triad.</dd></div>
            <div className="wound-codex-entry"><dt>Anchor Rail</dt><dd>which of the ten anchors are currently lit in this mode.</dd></div>
            <div className="wound-codex-entry"><dt>Canvas</dt><dd>the mode's payload: caller, ledger, or thin-Wound terrain read.</dd></div>
            <div className="wound-codex-entry"><dt>Quickhack Panel</dt><dd>Operating only — deploy denies/grants on wound-bonded devices. Costs RAM.</dd></div>
            <div className="wound-codex-entry"><dt>Point-of-Sale</dt><dd>Transactions only — everyday buys routed through the veins. Consent required on tier-07+.</dd></div>
            <div className="wound-codex-entry"><dt>Telemetry Rail</dt><dd>right-side blocks: perception, tier, ghostline traffic, blood flow.</dd></div>
          </dl>
        </div>
      </section>

      <footer className="wound-foot">
        <span>heart-in-chrome · <b>bastion</b> · strata <b>07</b></span>
        <span className="is-warn">render-fault · seam <b>OPEN</b></span>
        <span>primarch · <b>attend</b></span>
      </footer>
    </div>
  );
}
