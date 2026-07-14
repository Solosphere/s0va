import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import sharp from 'sharp';

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT_URL,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

// Widths the client is allowed to request via ?w=. Values are snapped up to the
// nearest allowed width so an attacker can't fill memory with arbitrary sizes.
const ALLOWED_WIDTHS = [200, 400, 800, 1200, 1600, 2000];

function parseWidth(rawWidth) {
  if (rawWidth == null) return null;
  const n = Number.parseInt(rawWidth, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  for (const w of ALLOWED_WIDTHS) if (w >= n) return w;
  return ALLOWED_WIDTHS[ALLOWED_WIDTHS.length - 1];
}

async function readObjectFully(key) {
  const response = await s3Client.send(
    new GetObjectCommand({ Bucket: process.env.R2_BUCKET_NAME, Key: key })
  );
  const body = response.Body;
  const chunks = [];
  for await (const chunk of body) chunks.push(chunk);
  return { buffer: Buffer.concat(chunks), contentType: response.ContentType };
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { filename } = req.query;

    if (!filename || filename.includes('..') || filename.includes('/')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }

    const r2Key = filename;

    // Full-res source images decode to ~10× their file size in raw pixels; a
    // ~3 MB WebP can be 280+ MB decoded — well past mobile Safari's per-page
    // budget. If the client asks for a specific width, resize server-side and
    // return the bytes inline. Otherwise fall through to the signed-URL
    // redirect (kept for videos and clients that don't set ?w).
    const requestedWidth = parseWidth(req.query.w);
    if (requestedWidth) {
      const { buffer } = await readObjectFully(r2Key);
      const resized = await sharp(buffer, { failOnError: false, sequentialRead: true })
        .rotate()
        .resize(requestedWidth, null, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 3 })
        .toBuffer();
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Content-Length', String(resized.length));
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('Vary', 'Accept');
      return res.status(200).end(resized);
    }

    const command = new GetObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: r2Key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    res.redirect(signedUrl);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
}
