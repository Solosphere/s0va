import { useNavigate } from 'react-router-dom';
import { timeline } from '../data/caseStudies';

// A Cyberpunk-style "metro line" of the career: chronological stations from
// Parsons (2020) to the present role. Each station with a `to` scrolls to that
// place's projects below.
export default function LogTimeline() {
  const navigate = useNavigate();

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
