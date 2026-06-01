const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authRequired = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Missing authorization header' });
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return res.status(401).json({ success: false, message: 'Invalid authorization format' });
  }

  const tokenString = parts[1];

  jwt.verify(tokenString, config.jwtSecret, (err, decoded) => {
    if (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    req.user = {
      userID: decoded.sub,
      role: decoded.role,
    };
    next();
  });
};

module.exports = authRequired;
