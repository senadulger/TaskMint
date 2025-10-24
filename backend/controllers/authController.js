// controllers/authController.js

const User = require('../models/User'); // User modelimizi import ettik
const bcrypt = require('bcrypt'); // Şifreleme için bcrypt
const generateToken = require('../utils/generateToken'); // Token üreticimiz

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Gerekli alanlar var mı?
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Lütfen tüm alanları doldurun' });
    }

    // 2. Bu email daha önce alınmış mı?
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
    }

    // 3. Parolayı Şifreleme (Vize Req. 5) 
    const salt = await bcrypt.genSalt(10); // Şifreleme "tuzu"
    const hashedPassword = await bcrypt.hash(password, salt); // Parola şifrelendi

    // 4. Yeni kullanıcıyı veritabanına oluşturma
    const user = await User.create({
      name,
      email,
      password: hashedPassword, // Veritabanına şifreli parolayı kaydet
    });

    // 5. Kullanıcı başarılıyla oluşturulduysa, token üret ve geri döndür
    if (user) {
      res.status(201).json({ // 201 = Başarıyla Oluşturuldu
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Kullanıcıya token ver
      });
    } else {
      res.status(400).json({ message: 'Geçersiz kullanıcı verisi' });
    }
  } catch (error) {
    res.status(500).json({ message: `Sunucu Hatası: ${error.message}` });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Kullanıcıyı email ile veritabanında bul
    const user = await User.findOne({ email });

    // 2. Kullanıcı var mı? VE girilen şifre doğru mu?
    // bcrypt.compare, girilen şifre (password) ile veritabanındaki şifreli parolayı (user.password) karşılaştırır.
    if (user && (await bcrypt.compare(password, user.password))) {
      // Bilgiler doğruysa (Vize Req. 3) 
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id), // Yeni bir token ver
      });
    } else {
      // Bilgiler yanlışsa (Vize Req. 4 - Invalid login) 
      res.status(400).json({ message: 'Geçersiz email veya şifre' });
    }
  } catch (error) {
    res.status(500).json({ message: `Sunucu Hatası: ${error.message}` });
  }
};

// Fonksiyonları dışa aktar
module.exports = {
  registerUser,
  loginUser,
};