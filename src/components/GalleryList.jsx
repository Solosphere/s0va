import React, { useState, useEffect, useRef, useMemo } from 'react';
import GalleryCard from './GalleryCard';
import SearchBar from './SearchBar';
import { useNavigate, Link } from 'react-router-dom';
import GalleryConsole from './GalleryConsole';
import Loading from './Loading';
import { AnimatePresence, motion } from 'framer-motion';
import { useProducts } from '../context/ProductsProvider';
import { matchesSearch } from '../utils/search';
import { nextFrame, waitForVisibleMedia } from '../utils/mediaReady';
import { useGalleryScrollRestore } from '../utils/useScrollRestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronLeft } from '@fortawesome/free-solid-svg-icons';

const itemsPerPage = 16;
const maxButtonsToShow = 4;

// Medium keywords used to seed the search autocomplete
const MEDIUM_TERMS = [
  'Oil', 'Acrylic', 'Graphite', 'Charcoal', 'Photography',
  'Digital', 'Sculpture', 'Tattoo', 'Video', 'Collage', 'Marker',
];

const GalleryList = () => {
  const { products, loading: productsLoading, error } = useProducts();
  const navigate = useNavigate();
  

  const [filters, setFilters] = useState({
    date: 'all',
    media: 'all',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // Default sorting by name
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false); // in-page loader (route entry is covered by the app overlay)
  const [showViolentContent, setShowViolentContent] = useState(false);

  const loadTokenRef = useRef(0);

  // Full-screen loader for deliberate in-page navigation (pagination / filter /
  // sort / discretion). Holds until the new page's visible card images have
  // actually loaded (no pop-in), bounded by a min display + max timeout.
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
    handleFilterChange();
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

  const handlePageChange = (pageNumber) => {
    triggerLoader();
    setCurrentPage(pageNumber);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('page', pageNumber);
    navigate(`/gallery?${newParams.toString()}`);
  };

  const handleFilterChange = () => {
    triggerLoader();
    setCurrentPage(1);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('page', '1');
    navigate(`/gallery?${newParams.toString()}`);
  };

  const handleSortChange = () => {
    triggerLoader();
    setCurrentPage(1);
    const newParams = new URLSearchParams(window.location.search);
    newParams.set('page', '1');
    navigate(`/gallery?${newParams.toString()}`);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(1); // Resets page when search term changes
    // Update URL parameter based on the new search term
  const newParams = new URLSearchParams(window.location.search);
  newParams.set('page', '1');
  navigate(`/gallery?${newParams.toString()}`);
  }
  
  

  useEffect(() => {
    // Extract query parameters from the location
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = parseInt(searchParams.get('page'), 10) || 1;
    // Set the state based on query parameters
    setCurrentPage(pageParam);
  }, []);

  // Top on fresh entry; restore position when returning from a piece's detail.
  useGalleryScrollRestore('galleryScrollY');

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

  const totalPages = Math.ceil(applyFiltersAndSort().length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = applyFiltersAndSort().slice(indexOfFirstItem, indexOfLastItem);

  const renderPaginationButtons = () => {
    const buttons = [];
    const totalPages = Math.ceil(applyFiltersAndSort().length / itemsPerPage);

    let startPage = Math.max(1, currentPage - Math.floor(maxButtonsToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxButtonsToShow - 1);

    if (endPage - startPage + 1 < maxButtonsToShow) {
      startPage = Math.max(1, endPage - maxButtonsToShow + 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button className="pagination-prev" key="prev" onClick={() => handlePageChange(currentPage - 1)}>
        <FontAwesomeIcon icon={faChevronLeft}  />
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => handlePageChange(i)} className={currentPage === i ? 'active' : ''}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      buttons.push(
        <button className="pagination-next" key="next" onClick={() => handlePageChange(currentPage + 1)}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      );
    }

    return buttons;
  };

  return (
    <div className="gallery-list-container">
      <div className="filter-search-row">
        <div className="gallery-search">
        <h1 className="gallery-title">gallery</h1>
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
            {/* The arcade, surfaced as a terminal card; opens its case study */}
            {!filtersActive && currentPage === 1 && (
              <Link to="/engineering/blacksite" className="gallery-arcade-card">
                <span className="cf-log-prompt">root@wound.os</span>
                <h3>BLACKSITE</h3>
                <p>Two playable browser games, built from scratch in React + canvas.</p>
                <span className="cf-log-cta">open ▸</span>
              </Link>
            )}
            {currentItems.map((product) => (
              <GalleryCard key={product.id} product={product} currentPage={currentPage} showViolentContent={showViolentContent} />
            ))}
          </div>

          <div className="pagination">
            {renderPaginationButtons()}
          </div>
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