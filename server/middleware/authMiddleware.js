const jwt = require('jsonwebtoken');

// Middleware to only allow admins
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admins only' });
    }

    req.user = decoded; // Attach user to request
    next(); // Move to the next middleware or route
  } catch (error) {
    res.status(401).json({ message: 'Invalid token', error: error.message });
  }
};

module.exports = { verifyAdmin };
