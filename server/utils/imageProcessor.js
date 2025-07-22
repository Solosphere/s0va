import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

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

    let image = sharp(imagePath);

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
      .webp({ quality })
      .toBuffer();

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