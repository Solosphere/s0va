import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import LogTimeline from '../components/LogTimeline';
import LogSectionNav from '../components/LogSectionNav';
import caseStudies, { logMeta, schools, internships, internshipGroups, personalProjects, personalProjectIds, skills, findCaseStudy } from '../data/caseStudies';

// Engineering Log — a grid of work-experience "log entries" (STAR case
// studies). Each card links to its own detail page, mirroring the cache.
const EngineeringLog = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // The top case-studies grid is Salesforce work only. Anything that lives
  // in its own section below (internships, personal projects) is filtered
  // out here so it doesn't double up.
  const featuredCaseStudies = caseStudies.filter(
    (c) =>
      !internships.some((i) => i.id === c.id) &&
      !personalProjectIds.includes(c.id),
  );

  return (
    <div className="log-page">
      <header className="log-header">
        <h1>ENGINEERING LOG</h1>
        {/* One establishing terminal line for the whole page — subsequent
            sections no longer repeat the root@mettaire.os prefix so it reads as
            hierarchy, not decoration. */}
        <p className="log-prompt-line log-prompt-line--intro">
          <span className="log-prompt-sign" aria-hidden="true">root@mettaire.os ~ %</span>{' '}
          cat /var/log/career
        </p>
      </header>

      <LogTimeline />
      <LogSectionNav />

      <section className="log-case-studies" id="sec-case-studies">
        <div className="log-section-label">
          <h2>WORK EXPERIENCE</h2>
        </div>
        <div className="log-school">
          <div className="log-school-head log-work-head">
            <h3>{logMeta.role}</h3>
            <span>{logMeta.timeline}</span>
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
        </div>
      </section>

      <section className="log-internship" id="sec-internship">
        <div className="log-section-label">
          <h2>INTERNSHIPS</h2>
        </div>

        {internshipGroups.map((group) => (
          <div className="log-school" id={group.anchor} key={group.name}>
            <div className="log-school-head">
              <h3>{group.name}</h3>
              <span>{group.focus} · {group.period}</span>
            </div>
            <section className="log-grid log-grid--school">
              {group.projects.map((p, i) => {
                // Prefer the full case study when one exists — for OWN
                // internships the project references the case-study id
                // directly, so the card points at /engineering/:id and reuses
                // the case study's title/summary/stack. CareerSpring keeps
                // its inline gallery-linked entry.
                const cs = p.caseStudyId
                  ? findCaseStudy(p.caseStudyId)
                  : findCaseStudy(p.id);
                const to = cs ? `/engineering/${cs.id}` : `/gallery/${p.cacheId}`;
                const cta = cs ? 'read entry →' : 'view piece →';
                const key = p.caseStudyId || p.id;
                const title = cs ? cs.title : p.title;
                const summary = cs ? cs.summary : p.summary;
                const stack = cs ? cs.stack : p.stack;
                const type = cs ? 'Case study' : p.type;
                const year = cs ? cs.period : p.year;
                return (
                  <Reveal as="article" className="log-card" key={key} delay={(i % 2) * 0.08}>
                    <Link to={to} className="log-card-link">
                      <div className="log-card-top">
                        <span className="log-card-org">{type}</span>
                        <span className="log-card-org">{year}</span>
                      </div>
                      <h2 className="log-card-title">{title}</h2>
                      <p className="log-card-summary">{summary}</p>
                      <div className="log-chips">
                        {stack.slice(0, 4).map((tech) => (
                          <span key={tech} className="log-chip">{tech}</span>
                        ))}
                        {stack.length > 4 && (
                          <span className="log-chip log-chip--more">+{stack.length - 4}</span>
                        )}
                      </div>
                      <span className="log-card-cta" aria-hidden="true">{cta}</span>
                    </Link>
                  </Reveal>
                );
              })}
            </section>
          </div>
        ))}
      </section>

      <section className="log-personal" id="sec-personal">
        <div className="log-section-label">
          <h2>PERSONAL PROJECTS</h2>
        </div>

        {personalProjects.map((group) => (
          <div className="log-school" id={group.anchor} key={group.name}>
            <div className="log-school-head">
              <h3>{group.name}</h3>
              <span>{group.focus} · {group.period}</span>
            </div>
            <section className="log-grid log-grid--school">
              {group.projects.map((p, i) => {
                const cs = findCaseStudy(p.caseStudyId || p.id);
                if (!cs) return null;
                return (
                  <Reveal as="article" className="log-card" key={cs.id} delay={(i % 2) * 0.08}>
                    <Link to={`/engineering/${cs.id}`} className="log-card-link">
                      <div className="log-card-top">
                        <span className="log-card-org">Case study</span>
                        <span className="log-card-org">{cs.period}</span>
                      </div>
                      <h2 className="log-card-title">{cs.title}</h2>
                      <p className="log-card-summary">{cs.summary}</p>
                      <div className="log-chips">
                        {cs.stack.slice(0, 4).map((tech) => (
                          <span key={tech} className="log-chip">{tech}</span>
                        ))}
                        {cs.stack.length > 4 && (
                          <span className="log-chip log-chip--more">+{cs.stack.length - 4}</span>
                        )}
                      </div>
                      <span className="log-card-cta" aria-hidden="true">read entry →</span>
                    </Link>
                  </Reveal>
                );
              })}
            </section>
          </div>
        ))}
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
