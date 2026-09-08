// Minimal, dependency-free rate limiter for public write endpoints
// (appointments, reviews, surveys). Not a substitute for a proper
// rate-limiting layer (e.g. a reverse proxy or Redis-backed limiter)
// in production, but reasonable for an educational MVP.

function createRateLimiter({ windowMs = 60_000, max = 20 } = {}) {
  const hits = new Map(); // ip -> [timestamps]

  return function rateLimit(req, res, next) {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const now = Date.now();
    const timestamps = (hits.get(ip) || []).filter((t) => now - t < windowMs);

    if (timestamps.length >= max) {
      return res.status(429).json({
        success: false,
        error: { message: 'Too many requests. Please try again shortly.' }
      });
    }

    timestamps.push(now);
    hits.set(ip, timestamps);
    next();
  };
}

module.exports = createRateLimiter;
