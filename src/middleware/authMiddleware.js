const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
      }
      return res.status(500).json({ message: 'Failed to authenticate token' });
    }
    req.userId = decoded.id;
    next();
  });
}

module.exports = verifyToken;
