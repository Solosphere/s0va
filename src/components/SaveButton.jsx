import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faHeartBroken } from '@fortawesome/free-solid-svg-icons';
import { saveArtwork, removeSavedArtwork, isArtworkSaved } from '../utils/savedArtworks';

const SaveButton = ({ artwork, onSaveChange }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if artwork is already saved on component mount
    const checkSavedStatus = () => {
      const saved = isArtworkSaved(artwork.id);
      setIsSaved(saved);
    };
    
    checkSavedStatus();
  }, [artwork.id]);

  const handleToggleSave = async () => {
    setIsLoading(true);
    
    try {
      if (isSaved) {
        // Remove from saved
        const success = removeSavedArtwork(artwork.id);
        if (success) {
          setIsSaved(false);
          if (onSaveChange) onSaveChange(false);
        }
      } else {
        // Save artwork
        const success = saveArtwork(artwork);
        if (success) {
          setIsSaved(true);
          if (onSaveChange) onSaveChange(true);
        }
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`save-button ${isSaved ? 'saved' : ''} ${isLoading ? 'loading' : ''}`}
      onClick={handleToggleSave}
      disabled={isLoading}
      aria-label={isSaved ? 'Remove from saved artworks' : 'Save artwork'}
      title={isSaved ? 'Remove from saved' : 'Save artwork'}
    >
      <FontAwesomeIcon 
        icon={isSaved ? faHeartBroken : faHeart} 
        className="save-icon"
      />
    </button>
  );
};

export default SaveButton; 