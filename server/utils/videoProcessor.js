import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create processed videos directory inside server directory
const processedVideosDir = path.join(__dirname, '../processed-videos');
if (!fs.existsSync(processedVideosDir)) {
  fs.mkdirSync(processedVideosDir, { recursive: true });
}

export async function processVideo(videoPath, options = {}) {
  const {
    quality = 80,
    watermark = false,
    width,
    height
  } = options;

  try {
    // Check if file exists
    if (!fs.existsSync(videoPath)) {
      throw new Error('Video file not found');
    }

    // Generate unique filename for processed video
    const filename = path.basename(videoPath, path.extname(videoPath));
    const outputPath = path.join(processedVideosDir, `${filename}_processed_${uuidv4()}.mp4`);

    // Check if we already have a processed version
    const existingProcessed = findExistingProcessedVideo(filename);
    if (existingProcessed) {
      return existingProcessed;
    }

    // Process video using FFmpeg
    await processVideoWithFFmpeg(videoPath, outputPath, {
      quality,
      watermark,
      width,
      height
    });

    return outputPath;
  } catch (error) {
    console.error('Video processing error:', error);
    // Return original video if processing fails
    return videoPath;
  }
}

function findExistingProcessedVideo(filename) {
  try {
    const files = fs.readdirSync(processedVideosDir);
    const existingFile = files.find(file => file.startsWith(filename + '_processed_'));
    if (existingFile) {
      return path.join(processedVideosDir, existingFile);
    }
  } catch (error) {
    console.error('Error finding existing processed video:', error);
  }
  return null;
}

async function processVideoWithFFmpeg(inputPath, outputPath, options) {
  return new Promise((resolve, reject) => {
    const { quality, watermark, width, height } = options;

    // Build FFmpeg command - optimized for memory efficiency
    let ffmpegArgs = [
      '-i', inputPath,
      '-c:v', 'libx264',
      '-preset', 'ultrafast', // Faster encoding, less memory
      '-crf', Math.max(23, 51 - (quality * 0.33)), // Slightly higher CRF for smaller files
      '-c:a', 'aac',
      '-b:a', '96k', // Reduced audio bitrate
      '-threads', '2', // Limit threads to reduce memory usage
      '-max_muxing_queue_size', '1024' // Reduce buffer size
    ];

    // Add resize if dimensions provided
    if (width || height) {
      const scaleFilter = `scale=${width || -1}:${height || -1}:force_original_aspect_ratio=decrease`;
      ffmpegArgs.push('-vf', scaleFilter);
    }

    // Build filter chain
    let filterChain = [];
    
    // Add resize if dimensions provided
    if (width || height) {
      const scaleFilter = `scale=${width || -1}:${height || -1}:force_original_aspect_ratio=decrease`;
      filterChain.push(scaleFilter);
    }
    
    // Remove watermarks from center area using a more targeted approach
    filterChain.push('drawbox=x=(w-200)/2:y=(h-50)/2:w=200:h=50:color=black@0.8:t=fill');
    
    // Add watermark if explicitly requested (we don't want this)
    if (watermark) {
      const watermarkFilter = createWatermarkFilter();
      filterChain.push(watermarkFilter);
    }
    
    // Apply the filter chain
    if (filterChain.length > 0) {
      ffmpegArgs.push('-vf', filterChain.join(','));
    }

    ffmpegArgs.push('-y', outputPath);

    // Execute FFmpeg
    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    ffmpeg.stdout.on('data', (data) => {
      console.log(`FFmpeg stdout: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
      console.log(`FFmpeg stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}

function createWatermarkFilter() {
  // Create a simple text watermark using FFmpeg drawtext filter
  return `drawtext=text='MT8':fontcolor=white@0.3:fontsize=24:x=(w-text_w)/2:y=(h-text_h)/2:box=1:boxcolor=black@0.1:boxborderw=5`;
}

function createWatermarkRemovalFilter() {
  // Remove watermarks by cropping or blurring the center area where watermarks typically appear
  // This is a more aggressive approach to remove existing watermarks
  return `crop=iw:ih-50:0:25,scale=iw:ih`; // Crop out the center area and scale back
}

// Function to create video thumbnail
export async function createVideoThumbnail(videoPath, outputPath, time = '00:00:01') {
  return new Promise((resolve, reject) => {
    const ffmpegArgs = [
      '-i', videoPath,
      '-ss', time,
      '-vframes', '1',
      '-vf', 'scale=300:-1',
      '-y', outputPath
    ];

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath);
      } else {
        reject(new Error(`FFmpeg thumbnail process exited with code ${code}`));
      }
    });

    ffmpeg.on('error', (error) => {
      reject(error);
    });
  });
}

// Clean up old processed videos - more aggressive cleanup for memory management
export function cleanupOldProcessedVideos(maxAge = 2 * 60 * 60 * 1000) { // 2 hours instead of 24
  try {
    const files = fs.readdirSync(processedVideosDir);
    const now = Date.now();

    files.forEach(file => {
      const filePath = path.join(processedVideosDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`Cleaned up old processed video: ${file}`);
      }
    });
  } catch (error) {
    console.error('Error cleaning up processed videos:', error);
  }
} 