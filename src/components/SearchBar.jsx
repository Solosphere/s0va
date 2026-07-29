import { useState, useRef, useEffect, useMemo } from 'react';

const SearchBar = ({ searchTerm, setSearchTerm, suggestions = [], autoFocus = false }) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const containerRef = useRef(null);

  // Live autocomplete matches (completions of what's typed), deduped, capped
  const matches = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return [];
    const seen = new Set();
    return suggestions
      .filter((s) => {
        const low = s.toLowerCase();
        if (low === q || seen.has(low) || !low.includes(q)) return false;
        seen.add(low);
        return true;
      })
      .slice(0, 7);
  }, [searchTerm, suggestions]);

  // Close the dropdown on outside click
  useEffect(() => {
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  useEffect(() => {
    setHighlight(-1);
  }, [searchTerm]);

  const choose = (value) => {
    setSearchTerm(value);
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (!open || matches.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h + 1) % matches.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h - 1 + matches.length) % matches.length);
    } else if (e.key === 'Enter' && highlight >= 0) {
      e.preventDefault();
      choose(matches[highlight]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="search-bar" ref={containerRef}>
      <label>
        <input
          type="text"
          value={searchTerm}
          className="search-bar-input"
          placeholder="Search…"
          autoFocus={autoFocus}
          onChange={(e) => { setSearchTerm(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-autocomplete="list"
        />
      </label>
      {open && matches.length > 0 && (
        <ul className="search-suggest" role="listbox">
          {matches.map((m, i) => (
            <li key={m} role="option" aria-selected={i === highlight}>
              <button
                type="button"
                className={`search-suggest-item ${i === highlight ? 'highlight' : ''}`}
                onMouseDown={(e) => { e.preventDefault(); choose(m); }}
                onMouseEnter={() => setHighlight(i)}
              >
                {m}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
