const User = require('../models/User');
const bcrypt = require('bcrypt');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('express-async-handler');

// Kullanıcı oluşturma
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please fill in all fields' });
  }
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  const user = await User.create({ name, email, password});

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id, user.name, user.email, user.avatar), 
    });
  } else {
    return res.status(400).json({ message: 'Invalid user data' });
  }
});

// Kullanıcı girişi
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || 'Bear',
      token: generateToken(user._id, user.name, user.email, user.avatar || 'Bear'), 
    });
  } else {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Profilde kullanıcı bilgilerini getirme
const getUserProfile = asyncHandler(async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    avatar: req.user.avatar || 'Bear',
  });
});

// Profil bilgilerini güncelleme (isim ve avatar)
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.name = req.body.name || user.name;
    user.avatar = req.body.avatar || user.avatar;
    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      avatar: updatedUser.avatar || 'Bear',
      token: generateToken(updatedUser._id, updatedUser.name, updatedUser.email, updatedUser.avatar || 'Bear'), 
    });
  } else {
    return res.status(404).json({ message: 'User not found' });
  }
});

// Şifre güncelleme
const updateUserPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Please provide both current and new passwords' });
  }
  if (newPassword.length < 6) {
     return res.status(400).json({ message: 'New password must be at least 6 characters long'});
  }
  const user = await User.findById(req.user._id);
  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    return res.status(401).json({message: 'Invalid current password'});
  }
});

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  updateUserPassword,
};