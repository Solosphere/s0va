import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faHeartBroken, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { getSavedArtworks, removeSavedArtwork, clearAllSavedArtworks } from '../utils/savedArtworks';
import { useProducts } from '../context/ProductsProvider';

// Get protected image URL from products data
const getProtectedImageUrl = (filename, products) => {
  // Always return the full API URL, regardless of products data
  return `/api/media/image/${filename}`;
};

const SavedArtworks = () => {
  const [savedArtworks, setSavedArtworks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { products } = useProducts();

  useEffect(() => {
    loadSavedArtworks();
  }, []);

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



  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="saved-artworks-container">
        <div className="loading-message">Loading saved artworks...</div>
      </div>
    );
  }

  return (
    <div className="saved-artworks-container">
      <div className="saved-artworks-header">
        <Link to="/cache" className="back-link">
          <FontAwesomeIcon icon={faArrowLeft} />
          Back to Gallery
        </Link>
        <h1>Saved Artworks</h1>
        <div className="saved-artworks-stats">
          <span>{savedArtworks.length} artwork{savedArtworks.length !== 1 ? 's' : ''} saved</span>
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
            Browse Gallery
          </Link>
        </div>
      ) : (
        <div className="saved-artworks-grid">
          {savedArtworks.map((artwork) => (
            <div key={artwork.id} className="saved-artwork-card">
              <div className="artwork-image-container">
                <img
                  src={getProtectedImageUrl(artwork.image[0], products)}
                  alt={artwork.title}
                  loading="lazy"
                />
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
                <h3>{artwork.title}</h3>
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
    </div>
  );
};

export default SavedArtworks; 