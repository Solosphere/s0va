import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';
import { processImage } from './utils/imageProcessor.js';
import { processVideo, cleanupOldProcessedVideos } from './utils/videoProcessor.js';
import { validateRequest } from './middleware/security.js';
import products from './data/products.js';
import { generateSignedUrl, fileExists, getFileMetadata } from './utils/r2Service.js';

// Import image cache for memory management
import { imageCache } from './utils/imageProcessor.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for rate limiting behind Render's load balancer
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting for development (very lenient for testing)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (very lenient for testing)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json());

// Security middleware for all image/video requests (temporarily disabled for testing)
// app.use('/api/media', validateRequest);

// Products API endpoints
app.get('/api/products', (req, res) => {
  try {
    // Return all products with relative image URLs (frontend will handle the base URL)
    const productsWithUrls = products.map(product => ({
      ...product,
      image: product.image.map(img => {
        if (img.includes('.mp4')) {
          return `/api/media/video/${img}`;
        } else {
          return `/api/media/image/${img}`;
        }
      })
    }));
    
    res.json(productsWithUrls);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Add relative image URLs (frontend will handle the base URL)
    const productWithUrls = {
      ...product,
      image: product.image.map(img => {
        if (img.includes('.mp4')) {
          return `/api/media/video/${img}`;
        } else {
          return `/api/media/image/${img}`;
        }
      })
    };
    
    res.json(productWithUrls);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Image serving endpoint - serve from R2 with signed URLs
app.get('/api/media/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { width, height, quality, watermark, process } = req.query;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const r2Key = filename; // Files are stored directly in bucket root
    
    // Check if file exists in R2
    const exists = await fileExists(r2Key);
    if (!exists) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
        // Generate signed URL for protected access
    try {
      const signedUrl = await generateSignedUrl(r2Key, 3600); // 1 hour expiry
      
      // Redirect to signed URL (this prevents hotlinking and provides protection)
      res.redirect(signedUrl);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  } catch (error) {
    console.error('Image endpoint error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Video serving endpoint - serve from R2 with signed URLs
app.get('/api/media/video/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const r2Key = filename; // Files are stored directly in bucket root
    
    // Check if file exists in R2
    const exists = await fileExists(r2Key);
    if (!exists) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Generate signed URL for protected access
    try {
      const signedUrl = await generateSignedUrl(r2Key, 3600); // 1 hour expiry
      
      // Redirect to signed URL (this prevents hotlinking and provides protection)
      res.redirect(signedUrl);
    } catch (error) {
      console.error('Error generating signed URL:', error);
      res.status(500).json({ error: 'Failed to serve video' });
    }
  } catch (error) {
    console.error('Video endpoint error:', error);
    res.status(500).json({ error: 'Failed to serve video' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../dist')));

// For any route not handled by the API, serve index.html (for React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Clean up old processed videos on startup
  cleanupOldProcessedVideos();
  
  // Set up very frequent cleanup for large media collections
  setInterval(() => {
    cleanupOldProcessedVideos();
    
    // Log memory usage
    const memUsage = process.memoryUsage();
    console.log(`Memory usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
    
    // Force garbage collection if memory usage is high
    if (memUsage.heapUsed > 300 * 1024 * 1024) { // 300MB (lower threshold)
      console.log('High memory usage detected, forcing garbage collection');
      if (global.gc) {
        global.gc();
      }
    }
    
    // Clear image cache if memory is getting high
    if (memUsage.heapUsed > 250 * 1024 * 1024) { // 250MB
      console.log('Clearing image cache due to high memory usage');
      imageCache.clear();
    }
  }, 5 * 60 * 1000); // 5 minutes (very frequent)
}); 