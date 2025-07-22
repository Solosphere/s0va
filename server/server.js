import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';
import { processImage } from './utils/imageProcessor.js';
import { processVideo } from './utils/videoProcessor.js';
import { validateRequest } from './middleware/security.js';
import products from './data/products.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute (reduced from 15 minutes)
  max: 1000, // limit each IP to 1000 requests per windowMs (increased from 100)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// Security middleware for all image/video requests
app.use('/api/media', validateRequest);

// Products API endpoints
app.get('/api/products', (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    // Return all products with processed image URLs
    const productsWithUrls = products.map(product => ({
      ...product,
      image: product.image.map(img => {
        if (img.includes('.mp4')) {
          return `${baseUrl}/api/media/video/${img}`;
        } else {
          return `${baseUrl}/api/media/image/${img}`;
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
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Add processed image URLs
    const productWithUrls = {
      ...product,
      image: product.image.map(img => {
        if (img.includes('.mp4')) {
          return `${baseUrl}/api/media/video/${img}`;
        } else {
          return `${baseUrl}/api/media/image/${img}`;
        }
      })
    };
    
    res.json(productWithUrls);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Image processing endpoint
app.get('/api/media/image/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { width, height, quality, watermark } = req.query;
    
    // Validate filename to prevent directory traversal
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const originalPath = path.join(__dirname, '../public/images', filename);
    
    // Process the image
    const processedImageBuffer = await processImage(originalPath, {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : 80,
      watermark: watermark !== 'false'
    });

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour cache
      'Content-Type': 'image/webp',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });

    res.send(processedImageBuffer);
  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
});

// Video processing endpoint
app.get('/api/media/video/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const { quality } = req.query;
    
    // Validate filename
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const originalPath = path.join(__dirname, '../public/videos', filename);
    
    // Process video without watermark overlay
    const videoPath = await processVideo(originalPath, {
      quality: quality ? parseInt(quality) : 80,
      watermark: false
    });

    res.set({
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'video/mp4',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });

    res.sendFile(videoPath);
  } catch (error) {
    console.error('Video processing error:', error);
    res.status(500).json({ error: 'Failed to process video' });
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
}); 