require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const path = require('path');

connectDB();

const app = express();

// Frontend'in backend'e erişmesine izin verir
app.use(cors());
app.use(express.json());

// Temel bir test rotası
app.get('/', (req, res) => {
  res.send('Backend API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

const PORT = process.env.PORT || 5050;

// Server'ı sadece bu dosya doğrudan çalıştırıldığında başlat
// (Test sırasında jest dosyayı import edeceği için server otomatik başlamaz, çakışma olmaz)
if (require.main === module) {
  const PORT = process.env.PORT || 5050;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}

module.exports = app;