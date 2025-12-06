const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') 
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Token'ı 'JWT_SECRET' anahtarımızla doğrulama ve çözme (decode)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Token'ın içindeki 'id'yi kullanarak kullanıcıyı veritabanından bulma
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
      return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Kullanıcı admin ise devam et
  } else {
    // Admin değilse 401 veya 403 hatası döndür
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin};