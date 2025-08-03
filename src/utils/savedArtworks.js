// Utility functions for managing saved artworks in localStorage

const SAVED_ARTWORKS_KEY = 'savedArtworks';

// Get all saved artworks
export const getSavedArtworks = () => {
  try {
    const saved = localStorage.getItem(SAVED_ARTWORKS_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved artworks:', error);
    return [];
  }
};

// Save an artwork
export const saveArtwork = (artwork) => {
  try {
    const savedArtworks = getSavedArtworks();
    const isAlreadySaved = savedArtworks.some(saved => saved.id === artwork.id);
    
    if (!isAlreadySaved) {
      const artworkToSave = {
        ...artwork,
        savedAt: new Date().toISOString()
      };
      savedArtworks.push(artworkToSave);
      localStorage.setItem(SAVED_ARTWORKS_KEY, JSON.stringify(savedArtworks));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving artwork:', error);
    return false;
  }
};

// Remove an artwork from saved
export const removeSavedArtwork = (artworkId) => {
  try {
    const savedArtworks = getSavedArtworks();
    const filteredArtworks = savedArtworks.filter(artwork => artwork.id !== artworkId);
    localStorage.setItem(SAVED_ARTWORKS_KEY, JSON.stringify(filteredArtworks));
    return true;
  } catch (error) {
    console.error('Error removing saved artwork:', error);
    return false;
  }
};

// Check if an artwork is saved
export const isArtworkSaved = (artworkId) => {
  try {
    const savedArtworks = getSavedArtworks();
    return savedArtworks.some(artwork => artwork.id === artworkId);
  } catch (error) {
    console.error('Error checking if artwork is saved:', error);
    return false;
  }
};

// Clear all saved artworks
export const clearAllSavedArtworks = () => {
  try {
    localStorage.removeItem(SAVED_ARTWORKS_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing saved artworks:', error);
    return false;
  }
};

// Get saved artworks count
export const getSavedArtworksCount = () => {
  try {
    const savedArtworks = getSavedArtworks();
    return savedArtworks.length;
  } catch (error) {
    console.error('Error getting saved artworks count:', error);
    return 0;
  }
}; 