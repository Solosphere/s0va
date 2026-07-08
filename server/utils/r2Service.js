import { S3Client, GetObjectCommand, HeadObjectCommand, ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NodeHttpHandler } from '@smithy/node-http-handler';
import '../loadEnv.js';

// Debug: Log environment variables
console.log('R2 Configuration Debug:');
console.log('R2_ENDPOINT_URL:', process.env.R2_ENDPOINT_URL);
console.log('R2_ACCESS_KEY_ID:', process.env.R2_ACCESS_KEY_ID ? 'SET' : 'NOT SET');
console.log('R2_SECRET_ACCESS_KEY:', process.env.R2_SECRET_ACCESS_KEY ? 'SET' : 'NOT SET');
console.log('R2_BUCKET_NAME:', process.env.R2_BUCKET_NAME);

// R2 Configuration
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  // Fail fast instead of hanging forever if a connection to R2 stalls.
  maxAttempts: 3,
  requestHandler: new NodeHttpHandler({
    connectionTimeout: 5000, // ms to establish a socket
    requestTimeout: 20000, // ms of socket inactivity before aborting
  }),
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'soluscore-media';

// Generate signed URL for protected access
export async function generateSignedUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(r2Client, command, {
      expiresIn: expiresIn, // URL expires in 1 hour by default
    });

    return signedUrl;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
}

/**
 * Stream an object from R2 through Express (same-origin for the browser — avoids R2 CORS).
 * Forwards Range when present (needed for HTML5 video seeking).
 */
export async function streamObjectToResponse(key, req, res) {
  const input = {
    Bucket: BUCKET_NAME,
    Key: key,
  };
  if (req.headers.range) {
    input.Range = req.headers.range;
  }

  let response;
  try {
    response = await r2Client.send(new GetObjectCommand(input));
  } catch (err) {
    const code = err.name || err.Code;
    const status = err.$metadata?.httpStatusCode;
    if (code === 'NotFound' || code === 'NoSuchKey' || status === 404) {
      if (!res.headersSent) {
        res.status(404).json({ error: 'Not found' });
      }
      return;
    }
    throw err;
  }

  const httpStatus = response.$metadata?.httpStatusCode || 200;
  res.status(httpStatus);

  const contentType = response.ContentType || 'application/octet-stream';
  res.setHeader('Content-Type', contentType);
  if (response.ContentLength != null) {
    res.setHeader('Content-Length', String(response.ContentLength));
  }
  if (response.ContentRange) {
    res.setHeader('Content-Range', response.ContentRange);
  }
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Cache-Control', 'public, max-age=300');

  const body = response.Body;
  if (!body) {
    if (!res.headersSent) {
      res.status(500).json({ error: 'Empty body' });
    }
    return;
  }

  body.on('error', (e) => {
    console.error('R2 stream error:', e);
    if (!res.headersSent) {
      res.status(500).end();
    } else {
      res.destroy(e);
    }
  });

  body.pipe(res);
}

// Upload a file to R2 with an explicit content type (used for adding new assets).
export async function uploadFile(key, body, contentType) {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });
  await r2Client.send(command);
  return key;
}

// Check if file exists in R2
export async function fileExists(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    return true;
  } catch (error) {
    if (error.name === 'NotFound') {
      return false;
    }
    throw error;
  }
}

// Get file metadata
export async function getFileMetadata(key) {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await r2Client.send(command);
    return {
      contentType: response.ContentType,
      contentLength: response.ContentLength,
      lastModified: response.LastModified,
      etag: response.ETag,
    };
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
}

// Generate public URL (if you want some files publicly accessible)
export function getPublicUrl(key) {
  return `${process.env.R2_PUBLIC_URL}/${key}`;
}

// List files in a directory
export async function listFiles(prefix = '') {
  try {
    const command = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      Prefix: prefix,
    });

    const response = await r2Client.send(command);
    return response.Contents || [];
  } catch (error) {
    console.error('Error listing files:', error);
    throw error;
  }
} 