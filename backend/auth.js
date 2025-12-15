const jwt = require('jsonwebtoken');
const { db } = require('./firebase');

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    
    // Get user data from Firebase
    const userSnapshot = await db.ref(`users/${decoded.uid}`).once('value');
    const user = userSnapshot.val();
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    // Add user info to request
    req.user = {
      id: decoded.uid,
      ...user
    };
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Authentication error' });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
      const userSnapshot = await db.ref(`users/${decoded.uid}`).once('value');
      const user = userSnapshot.val();
      
      if (user) {
        req.user = {
          id: decoded.uid,
          ...user
        };
      }
    }
    
    next();
  } catch (error) {
    // Continue without auth if token is invalid
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth
};