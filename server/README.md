# MT8 - Server-Side Image Processing

This backend server provides secure, server-side image and video processing for the MT8 art portfolio. It includes watermarking, resizing, format conversion, and access controls to protect your artwork.

## Features

- **Image Processing**: Resize, compress, and convert images to WebP format
- **Video Processing**: Optimize videos with FFmpeg
- **Watermarking**: Add "MT8" watermarks to images and videos
- **Security**: Rate limiting, referer validation, bot detection
- **Caching**: Efficient caching of processed media
- **Responsive Images**: Generate multiple sizes for different devices

## Prerequisites

- Node.js 18+ 
- FFmpeg (for video processing)
- Sharp (for image processing)

## Installation

1. **Install FFmpeg** (required for video processing):

   **macOS:**
   ```bash
   brew install ffmpeg
   ```

   **Ubuntu/Debian:**
   ```bash
   sudo apt update
   sudo apt install ffmpeg
   ```

   **Windows:**
   Download from https://ffmpeg.org/download.html

2. **Install Node.js dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp config.env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## API Endpoints

### Images
```
GET /api/media/image/:filename
```

**Query Parameters:**
- `width` (number): Resize width
- `height` (number): Resize height  
- `quality` (number): JPEG/WebP quality (1-100)
- `watermark` (boolean): Add watermark (default: true)

**Example:**
```
GET /api/media/image/artwork.webp?width=800&quality=85&watermark=true
```

### Videos
```
GET /api/media/video/:filename
```

**Query Parameters:**
- `quality` (number): Video quality (1-100)

**Example:**
```
GET /api/media/video/artwork.mp4?quality=80
```

## Security Features

### Rate Limiting
- 100 requests per 15 minutes per IP
- Configurable limits per endpoint

### Request Validation
- Referer validation (only allow requests from your domain)
- User agent validation (block known bots)
- Origin validation (CORS protection)

### File Access Control
- Directory traversal prevention
- File type validation
- Suspicious pattern detection

## Image Processing Options

### Watermarking
- Semi-transparent "MT8" text
- 45-degree rotation
- Configurable opacity and size
- Stroke outline for visibility

### Format Conversion
- Convert all images to WebP for better compression
- Maintain quality while reducing file size
- Progressive loading support

### Responsive Sizes
- Mobile: 300px width, 70% quality
- Tablet: 600px width, 80% quality  
- Desktop: 1200px width, 85% quality
- Large screens: 1920px width, 90% quality

## Frontend Integration

The frontend uses the `ImageService` utility to generate processed URLs:

```javascript
import { ImageService } from '../utils/imageService.js';

// Get processed image URL
const imageUrl = ImageService.getProcessedImageUrl('/images/artwork.jpg', {
  width: 800,
  quality: 85,
  watermark: true
});

// Get processed video URL
const videoUrl = ImageService.getProcessedVideoUrl('/videos/artwork.mp4', {
  quality: 80
});
```

## Performance Optimization

### Caching
- Processed images are cached in memory
- Cache keys include all processing parameters
- Automatic cache cleanup

### Lazy Loading
- Images load only when needed
- Progressive quality enhancement
- Fallback to original files if processing fails

### CDN Integration
For production, consider using a CDN like Cloudflare or AWS CloudFront in front of this server for better global performance.

## Monitoring

### Logs
The server logs:
- Processing errors
- Suspicious activity
- Rate limit violations
- Cache hits/misses

### Health Check
```
GET /api/health
```

Returns server status and timestamp.

## Production Deployment

### Environment Variables
```env
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://yourdomain.com
MAX_REQUESTS_PER_MINUTE=60
CACHE_DURATION=3600
```

### Process Manager
Use PM2 for production:
```bash
npm install -g pm2
pm2 start server.js --name "soluscore-api"
pm2 save
pm2 startup
```

### Reverse Proxy
Configure Nginx or Apache to proxy requests to the Node.js server:

```nginx
location /api/ {
    proxy_pass http://localhost:3001;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
}
```

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed and in PATH
   - Set `FFMPEG_PATH` in environment variables

2. **Sharp installation issues**
   - On macOS: `npm install --build-from-source`
   - On Linux: Install build tools first

3. **Memory issues**
   - Reduce concurrent processing
   - Increase Node.js memory limit: `node --max-old-space-size=4096 server.js`

4. **CORS errors**
   - Check `FRONTEND_URL` in environment
   - Verify CORS configuration

### Debug Mode
Set `NODE_ENV=development` for detailed logging.

## License

This server is part of the MT8 project. All rights reserved. 