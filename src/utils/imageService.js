const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Append a width hint to an `/api/media/image/...` URL so the backend serves
 * a downscaled WebP variant instead of the full-resolution asset.
 *
 * Full-res source images (some at 3+ MB) decode to 40–60 MB of raw pixels once
 * expanded, and mobile Safari's ~256 MB per-page decoded-image budget was
 * being blown on multi-image pieces (crashing the tab to white). This helper
 * lets each context request the width it actually needs.
 *
 * Widths chosen for the four render contexts on the site:
 *   - RAIL_THUMB     240 — 60–90px thumbnails in the detail-page rail (2× for retina)
 *   - RELATED_CARD   400 — small "more from this series" cards
 *   - GALLERY_CARD   800 — gallery grid tiles + coverflow
 *   - HERO           1600 — full-bleed hero image on the detail page
 *
 * Non-image URLs (video, non-media paths) pass through untouched.
 */
export const WIDTHS = {
  RAIL_THUMB: 240,
  RELATED_CARD: 400,
  GALLERY_CARD: 800,
  HERO: 1600,
};

export function withImageWidth(url, width) {
  if (!url || !width) return url;
  // Only rewrite image endpoints; skip videos and anything else.
  if (!url.includes('/api/media/image/')) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}w=${width}`;
}

// Cache for processed images
const imageCache = new Map();

export class ImageService {
  static getProcessedImageUrl(originalPath, options = {}) {
    const {
      width,
      height,
      quality = 80,
      watermark = false // Disabled by default for cleaner portfolio
    } = options;

    // Extract filename from path
    const filename = originalPath.split('/').pop();
    
    // Create cache key
    const cacheKey = `${filename}_${width || 'auto'}_${height || 'auto'}_${quality}_${watermark}`;
    
    // Check cache first
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    // Build query parameters
    const params = new URLSearchParams();
    if (width) params.append('width', width);
    if (height) params.append('height', height);
    if (quality) params.append('quality', quality);
    if (watermark !== undefined) params.append('watermark', watermark);

    // Create the processed image URL
    const processedUrl = `${API_BASE_URL}/media/image/${filename}?${params.toString()}`;
    
    // Cache the URL
    imageCache.set(cacheKey, processedUrl);
    
    return processedUrl;
  }

  static getProcessedVideoUrl(originalPath, options = {}) {
    const {
      quality = 80
    } = options;

    const filename = originalPath.split('/').pop();
    const params = new URLSearchParams();
    if (quality) params.append('quality', quality);

    return `${API_BASE_URL}/media/video/${filename}?${params.toString()}`;
  }

  // Get responsive image URLs for different screen sizes
  static getResponsiveImageUrls(originalPath) {
    const sizes = [
      { width: 300, quality: 70 },   // Mobile
      { width: 600, quality: 80 },   // Tablet
      { width: 1200, quality: 85 },  // Desktop
      { width: 1920, quality: 90 }   // Large screens
    ];

    return sizes.map(size => ({
      ...size,
      url: this.getProcessedImageUrl(originalPath, size)
    }));
  }

  // Get thumbnail URL
  static getThumbnailUrl(originalPath, size = 150) {
    return this.getProcessedImageUrl(originalPath, {
      width: size,
      height: size,
      quality: 70,
      watermark: false
    });
  }

  // Clear cache
  static clearCache() {
    imageCache.clear();
  }

  // Preload images for better performance
  static preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to preload: ${url}`));
      img.src = url;
    });
  }

  // Preload multiple images
  static async preloadImages(urls) {
    const promises = urls.map(url => this.preloadImage(url));
    return Promise.allSettled(promises);
  }
}

// Hook for React components
export function useImageService() {
  return {
    getProcessedImageUrl: ImageService.getProcessedImageUrl,
    getProcessedVideoUrl: ImageService.getProcessedVideoUrl,
    getResponsiveImageUrls: ImageService.getResponsiveImageUrls,
    getThumbnailUrl: ImageService.getThumbnailUrl,
    preloadImage: ImageService.preloadImage,
    preloadImages: ImageService.preloadImages,
    clearCache: ImageService.clearCache
  };
} 