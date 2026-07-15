import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { timeline } from '../data/caseStudies';

const TAG = 'THE JOURNEY — PARSONS ▸ SALESFORCE';

// A Cyberpunk-style "metro line" of the career: chronological stations from
// Parsons (2020) to the present role. Each station with a `to` scrolls to that
// place's projects below. The header types itself out and energy flows the line.
export default function LogTimeline() {
  const navigate = useNavigate();
  const [typed, setTyped] = useState('');

  // Type the header out like a console line (instant when reduced-motion).
  useEffect(() => {
    if (document.documentElement.getAttribute('data-motion') === 'reduced') {
      setTyped(TAG);
      return undefined;
    }
    setTyped('');
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(TAG.slice(0, i));
      if (i >= TAG.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, []);

  // Anchor (#id) stops scroll to that institution's section; route stops navigate.
  const go = (to) => {
    if (!to) return;
    if (to.startsWith('#')) {
      document.getElementById(to.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      navigate(to);
    }
  };

  return (
    <nav className="log-timeline" aria-label="Career timeline">
      <div className="metro-tag">
        <span className="metro-tag-dot" aria-hidden="true" />
        <span className="metro-tag-text">
          {typed}
          <span className="metro-tag-cursor" aria-hidden="true">▮</span>
        </span>
      </div>
      <ol className="metro-line">
        {timeline.map((stop) => {
          const clickable = Boolean(stop.to);
          return (
            <li
              key={`${stop.year}-${stop.label}`}
              className={`metro-stop${stop.origin ? ' is-origin' : ''}${stop.current ? ' is-current' : ''}`}
            >
              <button
                type="button"
                className="metro-btn"
                onClick={() => go(stop.to)}
                disabled={!clickable}
                aria-label={`${stop.label}, ${stop.year}`}
              >
                <span className="metro-year">{stop.current ? 'NOW' : stop.year}</span>
                <span className="metro-node">
                  <span className="metro-dot" aria-hidden="true" />
                </span>
                <span className="metro-label">{stop.label}</span>
                {stop.sub && <span className="metro-sub">{stop.sub}</span>}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
