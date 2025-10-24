// config/db.js

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // .env dosyasındaki MONGO_URI'yi kullanarak bağlanmayı dene
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // Başarılı olursa konsola bu mesajı yaz
    console.log(`MongoDB Bağlandı: ${conn.connection.host}`);
  } catch (error) {
    // Hata olursa hatayı yazdır ve işlemi sonlandır
    console.error(`Hata: ${error.message}`);
    process.exit(1);
  }
};

// Bu fonksiyonu başka dosyalarda kullanabilmek için dışa aktar
module.exports = connectDB;