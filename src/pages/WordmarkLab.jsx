import { useState } from 'react';
import './WordmarkLab.css';

// Five candidate treatments for the METTAIRE wordmark. Each renders the same
// text with a distinct CSS class; the "hero" swaps between them via the state
// below, and the reference row underneath shows all five at their default
// nav-scale size so they can be compared at a glance.
const TREATMENTS = [
  {
    id: 'chromatic',
    label: 'Chromatic aberration',
    desc: 'Razor-thin cyan (right) + arterial-red (left) offsets over crisp black ink. Zero blur. Reads as CRT edge fringe / print mis-register.',
  },
  {
    id: 'letterpress',
    label: 'Letterpress deboss',
    desc: 'Dark ink with a paper-white inset highlight below and soft charcoal shadow above. Wordmark reads as physically pressed into the surface.',
  },
  {
    id: 'ghost-strike',
    label: 'Ghost double-strike',
    desc: 'Crisp black wordmark plus a faint identical copy offset a few pixels down-right at ~10% opacity. Typewriter double-strike.',
  },
  {
    id: 'underline-scan',
    label: 'Underline scan',
    desc: 'Clean black ink, no glow on the letterforms — a 2px cyan hairline runs beneath the wordmark and pulses opacity slowly.',
  },
  {
    id: 'static-clean',
    label: 'Static clean',
    desc: 'Just changeling-neo at high letter-spacing. No effect at all. The rest of the site carries the cyberpunk vocabulary; the wordmark becomes the calm anchor.',
  },
];

export default function WordmarkLab() {
  const [active, setActive] = useState('chromatic');
  const current = TREATMENTS.find((t) => t.id === active);

  return (
    <div className="wordmark-lab">
      <header className="wordmark-lab-header">
        <span className="wordmark-lab-chip">LAB.01</span>
        <h1>WORDMARK TREATMENTS</h1>
        <p className="wordmark-lab-lede">
          Five candidate skins for the METTAIRE wordmark in light mode. Toggle
          between them below — the hero shows the active treatment at hero
          scale, and the reference row underneath shows every option at
          nav-bar scale for side-by-side comparison.
        </p>
      </header>

      <section className="wordmark-lab-hero" aria-live="polite">
        <span className={`wordmark-lab-target wordmark-treat-${active}`}>
          METTAIRE
          {active === 'underline-scan' && (
            <span className="wordmark-treat-underline-bar" aria-hidden="true" />
          )}
        </span>
      </section>

      <section className="wordmark-lab-controls" role="tablist" aria-label="Wordmark treatments">
        {TREATMENTS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            className={`wordmark-lab-tab ${active === t.id ? 'is-active' : ''}`}
            onClick={() => setActive(t.id)}
          >
            <span className="wordmark-lab-tab-label">{t.label}</span>
          </button>
        ))}
      </section>

      <section className="wordmark-lab-desc" aria-live="polite">
        <p>{current?.desc}</p>
      </section>

      <section className="wordmark-lab-reference">
        <h2 className="wordmark-lab-reference-title">Nav-scale reference</h2>
        <ul className="wordmark-lab-reference-list">
          {TREATMENTS.map((t) => (
            <li
              key={t.id}
              className={`wordmark-lab-reference-item ${active === t.id ? 'is-active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              <span className={`wordmark-lab-reference-mark wordmark-treat-${t.id}`}>
                METTAIRE
                {t.id === 'underline-scan' && (
                  <span className="wordmark-treat-underline-bar" aria-hidden="true" />
                )}
              </span>
              <span className="wordmark-lab-reference-caption">{t.label}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
