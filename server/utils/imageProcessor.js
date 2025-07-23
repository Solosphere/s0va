import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Very limited in-memory cache for processed images
export const imageCache = new Map();
const MAX_CACHE_SIZE = 10; // Only cache 10 images max

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function processImage(imagePath, options = {}) {
  const {
    width,
    height,
    quality = 80,
    watermark = false, // Disabled by default
    format = 'webp'
  } = options;

  try {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error('Image file not found');
    }

    // Create cache key
    const cacheKey = `${imagePath}_${width || 'auto'}_${height || 'auto'}_${quality}`;
    
    // Check cache first
    if (imageCache.has(cacheKey)) {
      return imageCache.get(cacheKey);
    }

    // Very aggressive memory limits for large image collections
    let image = sharp(imagePath, {
      limitInputPixels: 67108864, // Limit to ~67MP (much lower)
      failOnError: false,
      sequentialRead: true // Read sequentially to reduce memory
    });

    // Resize if dimensions provided
    if (width || height) {
      image = image.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    // Note: Watermark functionality removed for cleaner portfolio presentation
    // Protection is now handled through rate limiting, referer validation, and bot detection

    // Convert to WebP or JPEG with minimal effort for memory efficiency
    let processedBuffer;
    if (format === 'jpeg' || format === 'jpg') {
      processedBuffer = await image
        .jpeg({ quality })
        .toBuffer();
    } else {
      processedBuffer = await image
        .webp({ quality, effort: 0 }) // No effort = fastest, least memory
        .toBuffer();
    }

    // Cache the result (with size limit)
    if (imageCache.size >= MAX_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = imageCache.keys().next().value;
      imageCache.delete(firstKey);
    }
    imageCache.set(cacheKey, processedBuffer);

    return processedBuffer;
  } catch (error) {
    console.error('Image processing error:', error);
    throw error;
  }
}

// Function to generate different sizes for responsive images
export async function generateResponsiveSizes(imagePath, sizes = [300, 600, 1200]) {
  const results = {};
  
  for (const size of sizes) {
    try {
      const buffer = await processImage(imagePath, {
        width: size,
        quality: 80,
        watermark: false
      });
      results[size] = buffer;
    } catch (error) {
      console.error(`Error generating size ${size}:`, error);
    }
  }
  
  return results;
}

// Function to create thumbnail
export async function createThumbnail(imagePath, size = 150) {
  return await processImage(imagePath, {
    width: size,
    height: size,
    quality: 70,
    watermark: false
  });
} 