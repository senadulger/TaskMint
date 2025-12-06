const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); 

// Kullanıcı veritabanı şeması
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    
    avatar: {
      type: String,
      required: false,
      default: 'Bear', 
    },
    
    role: {
      type: String,
      enum: ['user', 'admin'], // Sadece 'user' veya 'admin' olabilir
      default: 'user',         // Kayıt olan herkes varsayılan olarak 'user' olur
      required: true
    }
  },
  {
    timestamps: true,
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  // Hash işlemi
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);

