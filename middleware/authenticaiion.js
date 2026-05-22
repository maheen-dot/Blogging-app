const jwt = require('jsonwebtoken');
const { verifyToken } = require('../services/authentication');

function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const token = req.cookies?.[cookieName];

    
    if (!token) {
      return next(); 
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