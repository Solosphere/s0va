import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// Simple in-memory cache for processed images (limited size)
const imageCache = new Map();
const MAX_CACHE_SIZE = 50; // Limit cache to 50 images

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

    // Limit concurrent processing to reduce memory usage
    let image = sharp(imagePath, {
      limitInputPixels: 268402689, // Limit to ~268MP to prevent memory issues
      failOnError: false
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

    // Convert to WebP with specified quality
    const processedBuffer = await image
      .webp({ quality, effort: 2 }) // Lower effort for faster processing
      .toBuffer();

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