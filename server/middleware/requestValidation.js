// Validate referer to ensure requests come from your domain
export function validateReferer(req) {
  const referer = req.get('Referer');
  
  // Allow requests without referer (direct access)
  if (!referer) {
    return true;
  }

  // List of allowed domains
  const allowedDomains = [
    'localhost:5173',
    's0va.run',
    'www.s0va.run'
  ];

  try {
    const url = new URL(referer);
    const hostname = url.hostname + (url.port ? `:${url.port}` : '');
    
    return allowedDomains.some(domain => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );
  } catch (error) {
    console.error('Invalid referer URL:', referer);
    return false;
  }
}

// Validate user agent to block suspicious clients
export function validateUserAgent(req) {
  const userAgent = req.get('User-Agent') || '';
  
  // Block known bot user agents
  const blockedUserAgents = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /wget/i,
    /curl/i,
    /python/i,
    /java/i,
    /perl/i,
    /ruby/i,
    /php/i
  ];

  return !blockedUserAgents.some(pattern => pattern.test(userAgent));
}

// Validate request origin
export function validateRequestOrigin(req) {
  const origin = req.get('Origin');
  
  // Allow requests without origin (direct access)
  if (!origin) {
    return true;
  }

  // List of allowed origins
  const allowedOrigins = [
    'http://localhost:5173',
    'https://s0va.run',
    'https://www.s0va.run'
  ];

  return allowedOrigins.includes(origin);
}

// Validate request headers
export function validateHeaders(req) {
  const requiredHeaders = ['User-Agent'];
  
  for (const header of requiredHeaders) {
    if (!req.get(header)) {
      return false;
    }
  }
  
  return true;
}

// Check for suspicious request patterns
export function detectSuspiciousPatterns(req) {
  const suspiciousPatterns = [
    // Multiple requests for the same resource
    /\.(jpg|jpeg|png|webp|mp4)$/i,
    // Requests with unusual parameters
    /[<>\"']/,
    // SQL injection attempts
    /(\b(union|select|insert|update|delete|drop|create)\b)/i,
    // XSS attempts
    /<script/i,
    /javascript:/i
  ];

  const url = req.url;
  const query = req.query;
  
  // Check URL for suspicious patterns
  if (suspiciousPatterns.some(pattern => pattern.test(url))) {
    return true;
  }
  
  // Check query parameters
  for (const key in query) {
    if (suspiciousPatterns.some(pattern => pattern.test(query[key]))) {
      return true;
    }
  }
  
  return false;
}

// Validate request frequency
export function validateRequestFrequency(req, maxRequestsPerMinute = 60) {
  const ip = req.ip || req.connection.remoteAddress;
  const now = Date.now();
  const oneMinuteAgo = now - (60 * 1000);
  
  // This is a simple in-memory implementation
  // In production, use Redis or a database
  if (!req.app.locals.requestCounts) {
    req.app.locals.requestCounts = new Map();
  }
  
  const requestCounts = req.app.locals.requestCounts;
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }
  
  const userRequests = requestCounts.get(ip);
  
  // Remove old requests
  const recentRequests = userRequests.filter(time => time > oneMinuteAgo);
  requestCounts.set(ip, recentRequests);
  
  if (recentRequests.length >= maxRequestsPerMinute) {
    return false;
  }
  
  recentRequests.push(now);
  return true;
} 