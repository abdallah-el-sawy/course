const config = require('../config');

/**
 * DEVELOPMENT-ONLY placeholder authentication.
 *
 * This is NOT a production security mechanism. It exists only so the
 * route structure (which endpoints will eventually be admin-only) is
 * already in place. Phase 3 should replace this with real
 * authentication (e.g. sessions or signed JWTs over HTTPS, HTTP-only
 * cookies, password hashing, etc).
 */
function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;

  if (auth !== `Bearer ${config.ADMIN_TOKEN}`) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized (development placeholder auth)' }
    });
  }

  next();
}

module.exports = requireAdmin;
