import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import LogTimeline from '../components/LogTimeline';
import caseStudies, { logMeta, schools, internships, skills } from '../data/caseStudies';

// Engineering Log — a grid of work-experience "log entries" (STAR case
// studies). Each card links to its own detail page, mirroring the cache.
const EngineeringLog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="log-page">
      <header className="log-header">
        <section className="rect-container">
          <section className="rect-1"></section>
          <section className="rect-2"></section>
        </section>
        <h1>ENGINEERING LOG</h1>
      </header>

      <LogTimeline />

      <div className="log-section-label log-career-intro">
        <p className="log-prompt-line">
          <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span>{' '}
          cat /var/log/career
        </p>
      </div>

      <div className="log-school-head log-work-head" id="exp-salesforce">
        <h3>{logMeta.role}</h3>
        <span>{logMeta.timeline}</span>
      </div>

      <div className="log-section-label log-section-label--sub log-section-label--nested">
        <p className="log-prompt-line">
          <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span>{' '}
          cat /var/log/career/case-studies
        </p>
        <h2><span className="log-tree" aria-hidden="true">└─ </span>CASE STUDIES</h2>
      </div>

      <section className="log-grid">
        {caseStudies.map((entry, i) => (
          <Reveal as="article" className="log-card" key={entry.id} delay={(i % 2) * 0.08}>
            <Link to={`/engineering/${entry.id}`} className="log-card-link">
              <div className="log-card-top">
                <span className="log-card-index">
                  #{String(i + 1).padStart(2, '0')}
                </span>
                <span className="log-card-org">{entry.org}</span>
              </div>
              <h2 className="log-card-title">{entry.title}</h2>
              <p className="log-card-period">{entry.period}</p>
              <p className="log-card-summary">{entry.summary}</p>
              <div className="log-chips">
                {entry.stack.slice(0, 4).map((tech) => (
                  <span key={tech} className="log-chip">{tech}</span>
                ))}
                {entry.stack.length > 4 && (
                  <span className="log-chip log-chip--more">+{entry.stack.length - 4}</span>
                )}
              </div>
              <span className="log-card-cta" aria-hidden="true">read entry →</span>
            </Link>
          </Reveal>
        ))}
      </section>

      <div className="log-school" id="exp-careerspring">
        <div className="log-school-head">
          <h3>CareerSpring</h3>
          <span>Internship · 2023</span>
        </div>
        <section className="log-grid log-grid--school">
          {internships.map((p, i) => (
            <Reveal as="article" className="log-card" key={p.id} delay={(i % 2) * 0.08}>
              <Link to={`/gallery/${p.cacheId}`} className="log-card-link">
                <div className="log-card-top">
                  <span className="log-card-org">{p.type}</span>
                  <span className="log-card-org">{p.year}</span>
                </div>
                <h2 className="log-card-title">{p.title}</h2>
                <p className="log-card-summary">{p.summary}</p>
                <div className="log-chips">
                  {p.stack.slice(0, 4).map((tech) => (
                    <span key={tech} className="log-chip">{tech}</span>
                  ))}
                  {p.stack.length > 4 && (
                    <span className="log-chip log-chip--more">+{p.stack.length - 4}</span>
                  )}
                </div>
                <span className="log-card-cta" aria-hidden="true">view piece →</span>
              </Link>
            </Reveal>
          ))}
        </section>
      </div>

      <section className="log-education">
        <div className="log-section-label">
          <p className="log-prompt-line">
            <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span>{' '}
            cat /var/log/education
          </p>
          <h2>EDUCATION</h2>
        </div>

        {schools.map((school) => (
          <div className="log-school" id={school.anchor} key={school.name}>
            <div className="log-school-head">
              <h3>{school.name}</h3>
              <span>{school.focus} · {school.period}</span>
            </div>
            <section className="log-grid log-grid--school">
              {school.projects.map((p, i) => (
                <Reveal as="article" className="log-card" key={p.id} delay={(i % 2) * 0.08}>
                  <Link to={`/gallery/${p.cacheId}`} className="log-card-link">
                    <div className="log-card-top">
                      <span className="log-card-org">{p.type}</span>
                      <span className="log-card-org">{p.year}</span>
                    </div>
                    <h2 className="log-card-title">{p.title}</h2>
                    <p className="log-card-summary">{p.summary}</p>
                    <div className="log-chips">
                      {p.stack.slice(0, 4).map((tech) => (
                        <span key={tech} className="log-chip">{tech}</span>
                      ))}
                      {p.stack.length > 4 && (
                        <span className="log-chip log-chip--more">+{p.stack.length - 4}</span>
                      )}
                    </div>
                    <span className="log-card-cta" aria-hidden="true">view piece →</span>
                  </Link>
                </Reveal>
              ))}
            </section>
          </div>
        ))}
      </section>

      <section className="log-skills">
        <div className="log-section-label">
          <p className="log-prompt-line">
            <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span>{' '}
            cat /var/log/skills
          </p>
          <h2>SKILLS</h2>
        </div>
        <div className="log-skill-groups">
          {skills.map((s) => (
            <div className="log-skill-group" key={s.group}>
              <h3 className="log-skill-group-name">{s.group}</h3>
              <div className="log-chips">
                {s.items.map((item) => (
                  <span key={item} className="log-chip">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default EngineeringLog;
