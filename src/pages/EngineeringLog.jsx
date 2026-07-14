import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import LogTimeline from '../components/LogTimeline';
import LogSectionNav from '../components/LogSectionNav';
import caseStudies, { logMeta, schools, internships, skills, findCaseStudy } from '../data/caseStudies';

// Engineering Log — a grid of work-experience "log entries" (STAR case
// studies). Each card links to its own detail page, mirroring the cache.
const EngineeringLog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // The top case-studies grid is Salesforce/OWN work + BLACKSITE. Anything
  // that lives in its own section below (e.g. internships) is filtered out
  // here so it doesn't double up.
  const featuredCaseStudies = caseStudies.filter(
    (c) => !internships.some((i) => i.id === c.id),
  );

  return (
    <div className="log-page">
      <header className="log-header">
        <h1>ENGINEERING LOG</h1>
        {/* One establishing terminal line for the whole page — subsequent
            sections no longer repeat the root@wound.os prefix so it reads as
            hierarchy, not decoration. */}
        <p className="log-prompt-line log-prompt-line--intro">
          <span className="log-prompt-sign" aria-hidden="true">root@wound.os ~ %</span>{' '}
          cat /var/log/career
        </p>
      </header>

      <LogTimeline />
      <LogSectionNav />

      <div className="log-school-head log-work-head" id="sec-case-studies">
        <h3>{logMeta.role}</h3>
        <span>{logMeta.timeline}</span>
      </div>

      <div className="log-section-label log-section-label--sub log-section-label--nested">
        <h2><span className="log-tree" aria-hidden="true">└─ </span>CASE STUDIES</h2>
      </div>

      <section className="log-grid">
        {featuredCaseStudies.map((entry, i) => (
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

      <section className="log-internship" id="sec-internship">
        <div className="log-section-label">
          <h2>INTERNSHIP</h2>
        </div>
        <div className="log-school">
          <div className="log-school-head">
            <h3>CareerSpring</h3>
            <span>Internship · Summer 2023</span>
          </div>
          <section className="log-grid log-grid--school">
            {internships.map((p, i) => {
              // Prefer the full case study when one exists — the internship
              // metadata (id / title / stack) already matches the case study,
              // so the card can point at /engineering/:id instead of dumping
              // the visitor into the art gallery.
              const cs = findCaseStudy(p.id);
              const to = cs ? `/engineering/${cs.id}` : `/gallery/${p.cacheId}`;
              const cta = cs ? 'read entry →' : 'view piece →';
              return (
                <Reveal as="article" className="log-card" key={p.id} delay={(i % 2) * 0.08}>
                  <Link to={to} className="log-card-link">
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
                    <span className="log-card-cta" aria-hidden="true">{cta}</span>
                  </Link>
                </Reveal>
              );
            })}
          </section>
        </div>
      </section>

      <section className="log-education" id="sec-education">
        <div className="log-section-label">
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

      <section className="log-skills" id="sec-skills">
        <div className="log-section-label">
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
