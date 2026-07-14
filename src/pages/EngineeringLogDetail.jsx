import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { findCaseStudy } from '../data/caseStudies';
import { getLastPath } from '../utils/navTracker';

// Pages a log entry can be opened from (carousel cards or the log index), so
// "back" returns to wherever the user actually came from.
const PAGE_LABELS = { '/': 'home', '/about': 'about', '/engineering': 'engineering' };

// One log entry rendered as a terminal-styled STAR write-up. Section headers
// read like console commands (cat problem, cat outcome ...) — the shell
// prompt itself only appears once, at the top back link, so the repeated
// prefix doesn't substitute for real hierarchy on each subsection.
const Prompt = ({ cmd }) => (
  <h2 className="log-section-head">
    <span className="log-cmd">$ {cmd}</span>
  </h2>
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
            <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span>{' '}
            cat {id}: no such entry
          </p>
          <Link to={backTo} className="log-back">← back to {backWhere}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="log-detail">
      <div className="log-detail-inner">
        <Link to={backTo} className="log-back">
          <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span> {backCmd}
        </Link>

        <header className="log-detail-head">
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
        </header>

        <Reveal as="section" className="log-section">
          <Prompt cmd="cat problem" />
          <p>{entry.problem}</p>
        </Reveal>

        <Reveal as="section" className="log-section">
          <Prompt cmd="cat role + constraints" />
          <p>{entry.constraints}</p>
        </Reveal>

        <Reveal as="section" className="log-section">
          <Prompt cmd="cat approach" />
          <ul className="log-approach">
            {entry.approach.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
        </Reveal>

        {entry.architecture && (
          <Reveal as="section" className="log-section">
            <Prompt cmd="tree architecture" />
            <pre className="log-arch">{entry.architecture}</pre>
          </Reveal>
        )}

        <Reveal as="section" className="log-section">
          <Prompt cmd="cat outcome" />
          <p>{entry.outcome}</p>
        </Reveal>

        <Reveal as="section" className="log-section log-section--reflection">
          <Prompt cmd="cat reflection" />
          <blockquote>{entry.reflection}</blockquote>
        </Reveal>

        <Link to={backTo} className="log-back log-back--bottom">← back to {backWhere}</Link>
      </div>
    </div>
  );
};

export default EngineeringLogDetail;
