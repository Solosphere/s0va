import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTrash,
  faHeartBroken
} from '@fortawesome/free-solid-svg-icons';
import { getSavedArtworks, clearAllSavedArtworks } from '../utils/savedArtworks';
import SearchBar from '../components/SearchBar';
import GalleryConsole from '../components/GalleryConsole';
import GalleryCard from '../components/GalleryCard';
import Loading from '../components/Loading';

const SavedArtworks = () => {
  const [savedArtworks, setSavedArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: 'all',
    media: 'all',
  });
  const [sortBy, setSortBy] = useState('recent');
  const [showViolentContent, setShowViolentContent] = useState(false);
  const [loadingDueToViewerDiscretion, setLoadingDueToViewerDiscretion] = useState(false);

  const sortOptions = [
    { label: 'Recent', value: 'recent' },
    { label: 'Oldest', value: 'oldest' },
    { label: 'Name', value: 'name' },
  ];

  useEffect(() => {
    loadSavedArtworks();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [savedArtworks, searchTerm, filters, sortBy, showViolentContent]);

  useEffect(() => {
    setLoadingDueToViewerDiscretion(false);
    window.scrollTo(0, 0);

    // Simulate an API call or any asynchronous operation
    setTimeout(() => {
      setLoadingDueToViewerDiscretion(false);
    }, 1000);
  }, [showViolentContent]);

  const loadSavedArtworks = () => {
    setIsLoading(true);
    const saved = getSavedArtworks();
    setSavedArtworks(saved);
    setIsLoading(false);
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to remove all saved artworks? This action cannot be undone.')) {
      const success = clearAllSavedArtworks();
      if (success) {
        setSavedArtworks([]);
      }
    }
  };

  const filterArtworks = (artwork) => {
    const { date, media } = filters;
    const dateFilter = date === 'all' || artwork.date === parseInt(date, 10);
    const mediaFilter = media === 'all' || artwork.media?.toLowerCase().includes(media.toLowerCase());
    return dateFilter && mediaFilter;
  };

  // Multi-field, multi-keyword search (mirrors the cache page)
  const searchFilter = (artwork) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return true;
    const haystack = [
      artwork.name,
      artwork.media,
      artwork.collection,
      artwork.description,
      artwork.date != null ? String(artwork.date) : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return query.split(/\s+/).every((token) => haystack.includes(token));
  };

  const sortArtworks = (a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    } else if (sortBy === 'oldest') {
      return new Date(a.savedAt) - new Date(b.savedAt);
    } else if (sortBy === 'recent') {
      return new Date(b.savedAt) - new Date(a.savedAt);
    }
  };

  const applyFiltersAndSort = () => {
    if (!savedArtworks || !Array.isArray(savedArtworks) || savedArtworks.length === 0) {
      setFilteredArtworks([]);
      return;
    }

    const filtered = savedArtworks.filter(filterArtworks).filter(searchFilter);
    const sorted = filtered.sort(sortArtworks);
    setFilteredArtworks(sorted);
  };

  const handleSearchChange = (newSearchTerm) => {
    setSearchTerm(newSearchTerm);
  };

  const handleFilterChange = () => {
    // Filter change is handled by useEffect
  };

  const handleSortChange = () => {
    // Sort change is handled by useEffect
  };

  const handleViewerDiscretionToggle = () => {
    setLoadingDueToViewerDiscretion(true);
    setShowViolentContent(!showViolentContent);
  };

  // Show loading if loading due to viewer discretion toggle
  if (loadingDueToViewerDiscretion) {
    return <Loading />;
  }

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="saved-artworks-container">
      <div className="saved-artworks-header">
        <h1>Saved Artworks</h1>
        <div className="saved-artworks-stats">
          <span>{filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? 's' : ''} saved</span>
          {savedArtworks.length > 0 && (
            <button 
              className="clear-all-button"
              onClick={handleClearAll}
              title="Remove all saved artworks"
            >
              <FontAwesomeIcon icon={faTrash} />
              Clear All
            </button>
          )}
        </div>
      </div>

      {savedArtworks.length === 0 ? (
        <div className="empty-state">
          <FontAwesomeIcon icon={faHeartBroken} className="empty-icon" />
          <h2>No saved artworks yet</h2>
          <p>Start exploring the gallery and save your favorite pieces!</p>
          <Link to="/gallery" className="browse-button">
            Browse Gallery
          </Link>
        </div>
      ) : (
        <>
          <div className="filter-search-row">
            <div className="gallery-search">
              <SearchBar searchTerm={searchTerm} setSearchTerm={handleSearchChange} className="gallery-search-bar" />
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

          {filteredArtworks.length === 0 ? (
            <div className="no-products-message">
              <p>No saved artworks match your search criteria.</p>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <div className="gallery-list">
              {filteredArtworks.map((artwork) => (
                <GalleryCard
                  key={artwork.id}
                  product={artwork}
                  showViolentContent={showViolentContent}
                  onSaveChange={loadSavedArtworks}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedArtworks; 