const jwt = require('jsonwebtoken');
const { verifyToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const token = req.cookies?.[cookieName];

    // ✅ CRITICAL FIX
    if (!token) {
      return next(); // just skip, don't verify
    }

    try {
      const user = verifyToken(token);
      req.user = user;
    } catch (err) {
      console.error("Invalid authentication token:", err.message);
    }

    next();
  };
}

module.exports = checkForAuthenticationCookie;