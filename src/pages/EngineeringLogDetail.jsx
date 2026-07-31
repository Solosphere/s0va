import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { findCaseStudy } from '../data/caseStudies';
import { getLastPath } from '../utils/navTracker';

// Pages a log entry can be opened from (carousel cards or the log index), so
// "back" returns to wherever the user actually came from.
const PAGE_LABELS = { '/': 'home', '/about': 'about', '/engineering': 'engineering' };

// One log entry rendered as a HUD-styled STAR write-up. Each section is a
// chamfered .log-detail-section panel with a floating SEC.NN chip in the
// top-left (same vocabulary as the engineering log index) and the console-
// command header (`$ cat problem`) preserved as an accent line beneath the
// chip — so the terminal read survives but the panel chrome matches the rest
// of the cockpit.
const SECTION_LABELS = {
  problem: 'cat problem',
  constraints: 'cat role + constraints',
  approach: 'cat approach',
  architecture: 'tree architecture',
  outcome: 'cat outcome',
  reflection: 'cat reflection',
};

const Section = ({ id, kind, className = '', children }) => (
  <Reveal as="section" className={`log-section log-detail-section ${className}`}>
    <span className="log-detail-section-tag" aria-hidden="true">
      SEC.{String(id).padStart(2, '0')}
    </span>
    <div className="log-detail-section-inner">
      <h2 className="log-section-head">
        <span className="log-cmd">$ {SECTION_LABELS[kind]}</span>
      </h2>
      {children}
    </div>
  </Reveal>
);

const EngineeringLogDetail = () => {
  const { id } = useParams();
  const entry = findCaseStudy(id);

  // Capture the origin at mount (before the route tracker overwrites it) so the
  // back button returns to the page that opened this entry, not always /engineering.
  const originRef = useRef(getLastPath());
  const origin = originRef.current;
  const originLabel = PAGE_LABELS[origin];
  const backTo = originLabel ? origin : '/engineering';
  const backWhere = originLabel || 'engineering';
  const backCmd = backTo === '/' ? 'cd ~' : backTo === '/engineering' ? 'cd ..' : `cd ~${backTo}`;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!entry) {
    return (
      <div className="log-detail log-detail--missing">
        <div className="log-detail-inner">
          <p className="log-prompt-line">
            <span className="log-prompt-sign" aria-hidden="true">root@mettaire.os ~ %</span>{' '}
            cat {id}: no such entry
          </p>
          <Link to={backTo} className="log-back">← back to {backWhere}</Link>
        </div>
      </div>
    );
  }

  // SEC.0N counter — the sections that actually render depend on whether
  // `entry.architecture` is present, so we build them into an array and let
  // the renderer number them sequentially.
  const sections = [
    { kind: 'problem',      body: <p>{entry.problem}</p> },
    { kind: 'constraints',  body: <p>{entry.constraints}</p> },
    {
      kind: 'approach',
      body: (
        <ul className="log-approach">
          {entry.approach.map((step, i) => <li key={i}>{step}</li>)}
        </ul>
      ),
    },
  ];
  if (entry.architecture) {
    sections.push({
      kind: 'architecture',
      body: <pre className="log-arch">{entry.architecture}</pre>,
    });
  }
  sections.push({ kind: 'outcome', body: <p>{entry.outcome}</p> });
  sections.push({
    kind: 'reflection',
    className: 'log-section--reflection',
    body: <blockquote>{entry.reflection}</blockquote>,
  });

  return (
    <div className="log-detail log-detail-hud">
      {/* Perception-window brackets — same HUD identity as the log index page,
          so navigating from the index into a detail feels like descending into
          the same cockpit rather than leaving the site. Decorative only. */}
      <div className="log-frame" aria-hidden="true">
        <span className="log-frame-corner log-frame-corner--tl" />
        <span className="log-frame-corner log-frame-corner--tr" />
        <span className="log-frame-corner log-frame-corner--bl" />
        <span className="log-frame-corner log-frame-corner--br" />
      </div>

      <div className="log-detail-inner">
        <Link to={backTo} className="log-back">
          <span className="log-prompt-sign" aria-hidden="true">root@mettaire.os ~ %</span> {backCmd}
        </Link>

        <header className="log-detail-head">
          <span className="log-detail-head-tag" aria-hidden="true">ENTRY</span>
          <div className="log-detail-head-inner">
            <span className="log-detail-org">{entry.org} · {entry.period}</span>
            <h1>{entry.title}</h1>
            <p className="log-detail-summary">{entry.summary}</p>
            <div className="log-chips">
              {entry.stack.map((tech) => (
                <span key={tech} className="log-chip">{tech}</span>
              ))}
            </div>
            {entry.launch && (
              <Link to={entry.launch.to} className="log-launch">{entry.launch.label}</Link>
            )}
          </div>
        </header>

        {sections.map((s, i) => (
          <Section key={s.kind} id={i + 1} kind={s.kind} className={s.className || ''}>
            {s.body}
          </Section>
        ))}

        <Link to={backTo} className="log-back log-back--bottom">← back to {backWhere}</Link>
      </div>
    </div>
  );
};

export default EngineeringLogDetail;
