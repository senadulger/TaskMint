// .env dosyasındaki değişkenleri yükler
require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');

connectDB();

const app = express();

// Middleware'leri (Ara yazılımları) kullan
app.use(cors()); // CORS'u etkinleştir
app.use(express.json()); // Gelen istekleri JSON olarak işle

// Temel bir test rotası
app.get('/', (req, res) => {
  res.send('Backend API çalışıyor...');
});

// '/api/auth' ile başlayan tüm istekleri 'authRoutes' dosyasına yönlendir
app.use('/api/auth', authRoutes);


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışmaya başladı.`);
});