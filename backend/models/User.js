// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Her email sadece bir kez kayıt olabilir
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // createdAt ve updatedAt alanlarını otomatik ekler
  }
);

// Şemayı 'User' adıyla model olarak dışa aktar
module.exports = mongoose.model('User', userSchema);