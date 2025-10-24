// utils/generateToken.js

const jwt = require('jsonwebtoken');

// Bu fonksiyon, parametre olarak aldığı kullanıcı ID'sini
// ve .env dosyamızdaki gizli anahtarı (JWT_SECRET) kullanarak
// 30 gün geçerli bir token oluşturur.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token'ın geçerlilik süresi
  });
};

module.exports = generateToken;