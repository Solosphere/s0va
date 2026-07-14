import React, { useState, useEffect, useRef, useMemo } from 'react';
import GalleryCard from './GalleryCard';
import GalleryHero from './GalleryHero';
import SearchBar from './SearchBar';
import GalleryConsole from './GalleryConsole';
import Loading from './Loading';
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts } from '../context/ProductsProvider';
import { matchesSearch } from '../utils/search';
import { nextFrame, waitForVisibleMedia } from '../utils/mediaReady';
import { useGalleryScrollRestore } from '../utils/useScrollRestore';
import { getLastPath } from '../utils/navTracker';

const BATCH_SIZE = 16;
const SHOWN_STORAGE_KEY = 'galleryShownCount';

// Medium keywords used to seed the search autocomplete
const MEDIUM_TERMS = [
  'Oil', 'Acrylic', 'Graphite', 'Charcoal', 'Photography',
  'Digital', 'Sculpture', 'Tattoo', 'Video', 'Collage', 'Marker',
];

const GalleryList = () => {
  const { products, loading: productsLoading, error } = useProducts();

  const [filters, setFilters] = useState({
    date: 'all',
    media: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  // Restore how many pieces the visitor had revealed before diving into a
  // detail page, so the load-more chain doesn't reset on return. Only honor
  // the stored count on return-from-detail — any other entry (top-nav, direct
  // load) starts at one batch, matching the scroll-restore hook's contract.
  const [shownCount, setShownCount] = useState(() => {
    if (typeof window === 'undefined') return BATCH_SIZE;
    const cameFromDetail = /^\/gallery\//.test(getLastPath());
    if (!cameFromDetail) {
      sessionStorage.removeItem(SHOWN_STORAGE_KEY);
      return BATCH_SIZE;
    }
    const saved = parseInt(sessionStorage.getItem(SHOWN_STORAGE_KEY) || '0', 10);
    return Math.max(BATCH_SIZE, saved || BATCH_SIZE);
  });
  const [loading, setLoading] = useState(false);
  const [showViolentContent, setShowViolentContent] = useState(false);

  const loadTokenRef = useRef(0);

  // Full-screen loader for deliberate in-page navigation (filter / sort /
  // discretion toggle). Holds until the new visible card images have actually
  // loaded (no pop-in), bounded by a min display + max timeout.
  const triggerLoader = () => {
    window.scrollTo(0, 0);
    setLoading(true);
    loadTokenRef.current += 1;
    const token = loadTokenRef.current;
    const start = Date.now();
    const MIN_MS = 350; // avoid an on/off flash when images are cached
    const MAX_MS = 4000; // safety cap

    (async () => {
      // let the new page's cards render, then wait for their visible images
      await nextFrame();
      await nextFrame();
      await waitForVisibleMedia(document.querySelector('.gallery-list'), MAX_MS - (Date.now() - start));
      if (token !== loadTokenRef.current) return; // superseded by a newer action
      const remaining = Math.max(0, MIN_MS - (Date.now() - start));
      window.setTimeout(() => {
        if (token === loadTokenRef.current) setLoading(false);
      }, remaining);
    })();
  };

  const handleViewerDiscretionToggle = () => {
    setShowViolentContent((prev) => !prev); // Toggle the state
    triggerLoader();
  };

  const sortOptions = [
    { label: 'Recent', value: 'recent' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Name', value: 'name' },
  ];

  // Autocomplete pool: titles, collections, years + common medium keywords
  const suggestionPool = useMemo(() => {
    const set = new Set(MEDIUM_TERMS);
    if (Array.isArray(products)) {
      products.forEach((p) => {
        if (p.name) set.add(p.name);
        if (p.collection) set.add(p.collection);
        if (p.date) set.add(String(p.date));
      });
    }
    return Array.from(set);
  }, [products]);

  const filtersActive =
    searchTerm.trim() !== '' || filters.date !== 'all' || filters.media !== 'all';

  const clearAll = () => {
    setSearchTerm('');
    setFilters({ date: 'all', media: 'all' });
    setShownCount(BATCH_SIZE);
    triggerLoader();
  };

  const filterProducts = (product) => {
    const { date, media } = filters;
    const dateFilter = date === 'all' || product.date === parseInt(date, 10);
    const mediaFilter = media === 'all' || product.media.toLowerCase().includes(media.toLowerCase());
    return dateFilter && mediaFilter;
  };

  // Typo-tolerant search across title, medium, collection, year and
  // description, so new visitors can find work without knowing exact titles
  // (e.g. "oil 2022", "tatto", "absurdsim").
  const searchFilter = (product) =>
    matchesSearch(searchTerm, [
      product.name,
      product.media,
      product.collection,
      product.description,
      product.date != null ? String(product.date) : '',
    ]);

  const sortProducts = (a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'oldest') {
      return a.date - b.date;
    } else if(sortBy === 'recent'){
      return b.date - a.date;
    }
  };

  const applyFiltersAndSort = () => {
    // Handle case where products is not an array or is empty
    if (!products || !Array.isArray(products) || products.length === 0) {
      return [];
    }
    
    const filteredProducts = products.filter(filterProducts).filter(searchFilter);
    const sortedProducts = filteredProducts.sort(sortProducts);
    return sortedProducts;
  };

  // Filter/sort/search always reset to the first batch — the "shown count"
  // only compounds while the visitor is actively exploring a stable list.
  const handleFilterChange = () => {
    setShownCount(BATCH_SIZE);
    triggerLoader();
  };

  const handleSortChange = () => {
    setShownCount(BATCH_SIZE);
    triggerLoader();
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setShownCount(BATCH_SIZE);
  };

  const handleLoadMore = () => {
    setShownCount((n) => n + BATCH_SIZE);
  };

  // Top on fresh entry; restore position when returning from a piece's detail.
  useGalleryScrollRestore('galleryScrollY');

  // Persist the load-more chain so returning from a piece doesn't collapse
  // the grid back to the first batch — the scroll restore lands on air
  // otherwise. Fresh entries (any nav that isn't a return-from-detail) reset
  // to one batch, matching the sibling scroll-to-top behavior above.
  useEffect(() => {
    return () => {
      sessionStorage.setItem(SHOWN_STORAGE_KEY, String(shownCount));
    };
  }, [shownCount]);

  // Show loading if products are still loading
  if (productsLoading) {
    return <Loading />;
  }

  // Show error if products failed to load
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  const filteredSorted = applyFiltersAndSort();
  const totalCount = filteredSorted.length;
  const currentItems = filteredSorted.slice(0, shownCount);
  const hasMore = shownCount < totalCount;

  // Context line under GALLERY — orients newcomers before they scroll. Years
  // derive from the actual product data, so it stays honest as pieces land.
  const productYears = (products || [])
    .map((p) => p.date)
    .filter((y) => typeof y === 'number' && !Number.isNaN(y));
  const startYear = productYears.length ? Math.min(...productYears) : null;
  const totalPieces = Array.isArray(products) ? products.length : 0;
  const subtitle = startYear
    ? `multimedia work, ${startYear}–present · ${totalPieces} pieces`
    : `multimedia work · ${totalPieces} pieces`;

  return (
    <div className="gallery-list-container">
      <div className="filter-search-row">
        <div className="gallery-search">
        <h1 className="gallery-title">GALLERY</h1>
        <SearchBar searchTerm={searchTerm} setSearchTerm={handleSearchChange} suggestions={suggestionPool} className="gallery-search-bar" />
        </div>
        <div className="filter-and-sort-row">
          <GalleryConsole
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
      <p className="gallery-subtitle">{subtitle}</p>

      {/* Hero only shows when the grid is unfiltered — no point orienting
          around a flagship piece when the visitor's already narrowed the set. */}
      {!filtersActive && <GalleryHero products={products} />}

      {currentItems.length === 0 ? (
        <div className="no-products-message">
          {filtersActive ? (
            <>
              <p>No pieces match your search and filters.</p>
              <button type="button" className="clear-filters-button" onClick={clearAll}>
                Clear all
              </button>
            </>
          ) : (
            <>
              <p>No products available at the moment.</p>
              <p>Please check back later or try refreshing the page.</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="gallery-list">
            {currentItems.map((product) => (
              <GalleryCard key={product.id} product={product} showViolentContent={showViolentContent} />
            ))}
          </div>

          {hasMore && (
            <div className="gallery-load-more-row">
              <button
                type="button"
                className="gallery-load-more"
                onClick={handleLoadMore}
                aria-label={`Load ${Math.min(BATCH_SIZE, totalCount - shownCount)} more pieces`}
              >
                Load more
                <span className="gallery-load-more-count">
                  {shownCount} / {totalCount}
                </span>
              </button>
            </div>
          )}
        </>
      )}

      {/* In-page loader (pagination / filter / sort) — fades out like the
          route-entry overlay so the two are visually identical. */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="loading-overlay"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <Loading />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GalleryList;