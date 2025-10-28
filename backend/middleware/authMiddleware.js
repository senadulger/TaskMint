const jwt = require('jsonwebtoken');
const User = require('../models/User'); // User modelimizi import ediyoruz

const protect = async (req, res, next) => {
  let token;

  // 1. Token'ı request header'ından (Authorization) oku
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer') // "Bearer <token>" formatı
  ) {
    try {
      // 2. Token'ı al ('Bearer' kelimesini ayır)
      token = req.headers.authorization.split(' ')[1];

      // 3. Token'ı doğrula
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Token'ın içindeki id ile kullanıcıyı veritabanında bul
      // (Parola hariç)
      req.user = await User.findById(decoded.id).select('-password');

      // 5. Bir sonraki adıma (controller'a) geç
      next();
    } catch (error) {
      console.error(error);
      res.status(401); // 401 Yetkisiz
      throw new Error('Yetkili değil, token başarısız');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Yetkili değil, token bulunamadı');
  }
};

module.exports = { protect };