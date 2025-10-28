const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' }); // .env dosyasını yükle

// Testler başlamadan önce veritabanına bağlan
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI bulunamadı, .env dosyasını kontrol edin.');
  }
  await mongoose.connect(mongoUri);
});

// Tüm testler bittikten sonra bağlantıyı kapat
afterAll(async () => {
  await mongoose.connection.close();
});