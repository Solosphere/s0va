import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  faTrash, 
  faHeartBroken,
  faEye,
  faEyeSlash
} from '@fortawesome/free-solid-svg-icons';
import { getSavedArtworks, removeSavedArtwork, clearAllSavedArtworks } from '../utils/savedArtworks';
import { useProducts } from '../context/ProductsProvider';
import SearchBar from '../components/SearchBar';
import GalleryFilterSection from '../components/GalleryFilterSection';
import SortSection from '../components/SortSection';
import Loading from '../components/Loading';

// Get protected image/video URL from products data
const getProtectedMediaUrl = (filename) => {
  if (filename.includes('.mp4')) {
    return `/api/media/video/${filename}`;
  } else {
    return `/api/media/image/${filename}`;
  }
};

// Get protected video URL for warning video
const getProtectedVideoUrl = (filename) => {
  return `/api/media/video/${filename}`;
};

const SavedArtworks = () => {
  const [savedArtworks, setSavedArtworks] = useState([]);
  const [filteredArtworks, setFilteredArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { products } = useProducts();

  // Search, filter, and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    date: 'all',
    media: 'all',
  });
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [showSort, setShowSort] = useState(false);
  const [showViolentContent, setShowViolentContent] = useState(false);
  const [loadingDueToViewerDiscretion, setLoadingDueToViewerDiscretion] = useState(false);

  // Video hover state
  const [hoveredVideoId, setHoveredVideoId] = useState(null);

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

  const handleRemoveArtwork = (artworkId) => {
    const success = removeSavedArtwork(artworkId);
    if (success) {
      setSavedArtworks(prev => prev.filter(artwork => artwork.id !== artworkId));
    }
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

  const searchFilter = (artwork) => {
    return artwork.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           artwork.description?.toLowerCase().includes(searchTerm.toLowerCase());
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Check if artwork has video
  const hasVideo = (artwork) => {
    return artwork.image && Array.isArray(artwork.image) && 
           artwork.image.some(item => item.includes('.mp4'));
  };

  // Get the first media item (image or video)
  const getFirstMediaItem = (artwork) => {
    if (!artwork.image || !Array.isArray(artwork.image) || artwork.image.length === 0) {
      return null;
    }
    return artwork.image[0];
  };

  // Handle video hover
  const handleVideoHover = (artworkId, isHovered) => {
    setHoveredVideoId(isHovered ? artworkId : null);
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
          <Link to="/cache" className="browse-button">
            Browse Cache
          </Link>
        </div>
      ) : (
        <>
          <div className="filter-search-row">
            <div className="gallery-search">
              <SearchBar searchTerm={searchTerm} setSearchTerm={handleSearchChange} className="gallery-search-bar" />
            </div>
            <div className="filter-and-sort-row">
              <GalleryFilterSection 
                filters={filters} 
                setFilters={setFilters} 
                showFilters={showFilters} 
                setShowFilters={setShowFilters} 
                handleFilterChange={handleFilterChange} 
              />
              <SortSection 
                sortOptions={sortOptions} 
                sortBy={sortBy} 
                setSortBy={setSortBy} 
                showSort={showSort} 
                setShowSort={setShowSort} 
                handleSortChange={handleSortChange} 
              />
              <button onClick={handleViewerDiscretionToggle} className="viewer-discretion-button">
                {showViolentContent ? <FontAwesomeIcon icon={faEye} /> : <FontAwesomeIcon icon={faEyeSlash} />}
              </button>
            </div>
          </div>

          {filteredArtworks.length === 0 ? (
            <div className="no-products-message">
              <p>No saved artworks match your search criteria.</p>
              <p>Try adjusting your filters or search terms.</p>
            </div>
          ) : (
                        <div className="saved-artworks-grid">
              {filteredArtworks.map((artwork) => (
                <div key={artwork.id} className="saved-artwork-card">
                  <div className="artwork-image-container">
                    {showViolentContent || !artwork.hasViolence ? (
                      <>
                        {hasVideo(artwork) ? (
                          <video
                            src={getProtectedMediaUrl(getFirstMediaItem(artwork))}
                            alt={artwork.name}
                            onMouseEnter={() => handleVideoHover(artwork.id, true)}
                            onMouseLeave={() => handleVideoHover(artwork.id, false)}
                            autoPlay
                            loop
                            muted={hoveredVideoId !== artwork.id}
                            playsInline
                            controls={false}
                            className="artwork-image"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <img
                            src={getProtectedMediaUrl(getFirstMediaItem(artwork))}
                            alt={artwork.name}
                            loading="lazy"
                            className="artwork-image"
                          />
                        )}
                      </>
                    ) : (
                      <div className="restricted-content-container">
                        <div>
                          <video className="warning-image" autoPlay muted width="200px" loop playsInline controls={false}>
                            <source src={getProtectedVideoUrl('toxic.mp4')} type="video/mp4" />
                            Your browser does not support the video tag.
                          </video>
                        </div>
                        <p>Content Warning: This piece may contain sensitive or explicit material. Proceed with caution. To view, click the button with the crossed-out eye.</p>
                      </div>
                    )}
                    <div className="artwork-overlay">
                      <button
                        className="remove-button"
                        onClick={() => handleRemoveArtwork(artwork.id)}
                        title="Remove from saved"
                      >
                        <FontAwesomeIcon icon={faHeartBroken} />
                      </button>
                    </div>
                  </div>
                  <div className="artwork-info">
                    <h3>{artwork.name}</h3>
                    <p className="artwork-description">{artwork.description}</p>
                    <p className="saved-date">Saved on {formatDate(artwork.savedAt)}</p>
                    <Link to={`/cache/${artwork.id}`} className="view-details-link">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SavedArtworks; 