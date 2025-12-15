const jwt = require('jsonwebtoken');
const { db } = require('./server');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userSnapshot = await db.ref(`users/${decoded.id}`).once('value');
    const user = userSnapshot.val();
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = { ...user, _id: decoded.id };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = auth;