import { useEffect, useState } from 'react';

// Anchor ids in the same order they appear on the page. The nav is sticky so a
// recruiter can jump between sections on a long page — Case Studies is where
// the professional pitch lives, Internship / Education / Skills are the
// supporting context.
const SECTIONS = [
  { id: 'sec-case-studies', label: 'Case Studies' },
  { id: 'sec-internship',   label: 'Internship' },
  { id: 'sec-education',    label: 'Education' },
  { id: 'sec-skills',       label: 'Skills' },
];

export default function LogSectionNav() {
  const [active, setActive] = useState(SECTIONS[0].id);

  // Track which section is "in view" so the pill highlights it. We treat the
  // top-third of the viewport as the read line — a section counts as active
  // once its heading crosses that line and stays active until the next one
  // does. Simpler and more predictable than a running scroll calculation.
  useEffect(() => {
    const nodes = SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);
    if (!nodes.length) return undefined;

    let current = active;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            current = e.target.id;
            setActive(current);
          }
        });
      },
      { rootMargin: '-30% 0px -60% 0px', threshold: 0 },
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const jumpTo = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    // Optimistic active — otherwise the pill lags behind smooth-scroll finish.
    setActive(id);
  };

  return (
    <nav className="log-section-nav" aria-label="Log sections">
      <ul>
        {SECTIONS.map((s) => (
          <li key={s.id}>
            <a
              href={`#${s.id}`}
              onClick={jumpTo(s.id)}
              className={active === s.id ? 'is-active' : ''}
              aria-current={active === s.id ? 'true' : undefined}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
