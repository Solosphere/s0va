import { useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faXmark } from '@fortawesome/free-solid-svg-icons';
import SearchBar from './SearchBar';
import GalleryConsole from './GalleryConsole';

/**
 * Floating condensed toolbar for the gallery. Once the full filter/search row
 * scrolls out of view, a compact pill (search · filters · discretion) pins just
 * below the site nav so controls stay one gesture away without covering the art.
 *
 * It shares all state with the tall toolbar (everything lives up in GalleryList),
 * so the two stay perfectly in sync — this is purely an alternate presentation.
 *
 * Behavior:
 *  - Appears once `toolbarRef` (the top .filter-search-row) leaves the viewport,
 *    via IntersectionObserver — robust across breakpoints and whether or not the
 *    hero is shown, unlike a hardcoded scroll threshold. It then stays pinned
 *    while the visitor scrolls down through the grid, controls always in reach.
 *  - Search expands inline out of its icon; filters reuse the same console panel.
 */
const GalleryStickyBar = ({
  toolbarRef,
  searchTerm,
  setSearchTerm,
  suggestions,
  filters,
  setFilters,
  handleFilterChange,
  sortOptions,
  sortBy,
  setSortBy,
  handleSortChange,
  showViolentContent,
  handleViewerDiscretionToggle,
}) => {
  const barRef = useRef(null);
  // pinned: the top toolbar has scrolled away, so the pill shows.
  const [pinned, setPinned] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const consoleActive =
    filters.date !== 'all' || filters.media !== 'all' || sortBy !== 'recent';

  // Reveal the pill only once the full toolbar is out of view.
  useEffect(() => {
    const target = toolbarRef?.current;
    if (!target) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => setPinned(!entry.isIntersecting),
      { rootMargin: '-8px 0px 0px 0px' }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [toolbarRef]);

  // Pin the pill just below the fixed nav — measured live so it stays correct
  // across breakpoints and any nav height changes, no magic number.
  useEffect(() => {
    const el = barRef.current;
    if (!el) return undefined;
    const setTop = () => {
      const nav = document.querySelector('.nav-header');
      const h = nav ? Math.round(nav.getBoundingClientRect().height) : 56;
      el.style.setProperty('--sticky-top', `${h + 10}px`);
    };
    setTop();
    window.addEventListener('resize', setTop);
    return () => window.removeEventListener('resize', setTop);
  }, []);

  // The input is always mounted (it just grows open), so focus it explicitly
  // when the field expands rather than relying on mount-time autofocus.
  useEffect(() => {
    if (searchOpen) barRef.current?.querySelector('.search-bar-input')?.focus();
  }, [searchOpen]);

  const closeSearch = () => setSearchOpen(false);

  return (
    <div
      className="gallery-sticky-bar"
      ref={barRef}
      data-pinned={pinned}
      data-search-open={searchOpen}
      role="region"
      aria-label="Gallery controls"
      aria-hidden={!pinned}
    >
      <div className="gallery-sticky-inner">
        {/* Search is one continuous, box-less unit: the magnifier stays fixed
            and the field grows out beside it (animated max-width), rather than
            swapping the icon for a separate boxed field. */}
        <div className={`sticky-search ${searchOpen ? 'is-open' : ''} ${!searchOpen && searchTerm.trim() ? 'has-active' : ''}`}>
          <button
            type="button"
            className="sticky-search-icon"
            onClick={() => setSearchOpen((o) => !o)}
            aria-label={searchOpen ? 'Close search' : 'Search'}
            aria-expanded={searchOpen}
            // Only reachable via keyboard once the bar is actually pinned.
            tabIndex={pinned ? 0 : -1}
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>

          <div className="sticky-search-field">
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              suggestions={suggestions}
            />
          </div>

          <button
            type="button"
            className="sticky-search-clear"
            onClick={closeSearch}
            aria-label="Close search"
            tabIndex={searchOpen ? 0 : -1}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        <GalleryConsole
          compact
          hasActiveFilters={consoleActive}
          filters={filters}
          setFilters={setFilters}
          handleFilterChange={handleFilterChange}
          sortOptions={sortOptions}
          sortBy={sortBy}
          setSortBy={setSortBy}
          handleSortChange={handleSortChange}
          showViolentContent={showViolentContent}
          handleViewerDiscretionToggle={handleViewerDiscretionToggle}
        />
      </div>
    </div>
  );
};

export default GalleryStickyBar;
