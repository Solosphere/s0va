import { validateReferer, validateUserAgent, validateRequestOrigin } from './requestValidation.js';
import path from 'path';

export function validateRequest(req, res, next) {
  try {
    // Validate referer
    if (!validateReferer(req)) {
      return res.status(403).json({ error: 'Invalid referer' });
    }

    // Validate user agent
    if (!validateUserAgent(req)) {
      return res.status(403).json({ error: 'Invalid user agent' });
    }

    // Validate request origin
    if (!validateRequestOrigin(req)) {
      return res.status(403).json({ error: 'Invalid request origin' });
    }

    // Add request timestamp for rate limiting
    req.requestTime = Date.now();

    next();
  } catch (error) {
    console.error('Security validation error:', error);
    res.status(500).json({ error: 'Security validation failed' });
  }
}

// Rate limiting for specific endpoints
export function createRateLimiter(windowMs, maxRequests) {
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(time => time > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);

    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ 
        error: 'Too many requests', 
        retryAfter: Math.ceil(windowMs / 1000) 
      });
    }

    userRequests.push(now);
    next();
  };
}

// Validate file access permissions
export function validateFileAccess(req, res, next) {
  const { filename } = req.params;
  
  // Prevent directory traversal
  if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return res.status(400).json({ error: 'Invalid filename' });
  }

  // Check file extension
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.mp4', '.mov', '.avi'];
  const ext = path.extname(filename).toLowerCase();
  
  if (!allowedExtensions.includes(ext)) {
    return res.status(400).json({ error: 'Invalid file type' });
  }

  next();
}

// Log suspicious activity
export function logSuspiciousActivity(req, res, next) {
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /scraper/i,
    /wget/i,
    /curl/i
  ];

  const userAgent = req.get('User-Agent') || '';
  const referer = req.get('Referer') || '';

  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(userAgent) || pattern.test(referer)
  );

  if (isSuspicious) {
    console.warn('Suspicious activity detected:', {
      ip: req.ip,
      userAgent,
      referer,
      url: req.url,
      timestamp: new Date().toISOString()
    });
  }

  next();
} 