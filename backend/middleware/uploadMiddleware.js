const multer = require('multer');
const path = require('path');

// Dosyayı Hafızada Tutma (Database'e kaydetmek için)
const storage = multer.memoryStorage();

// Dosya Formatı Kontrolü (Gereksinim 8.1)
// Supported: PDF, PNG, JPG, DOCX, XLSX
const checkFileType = (file, cb) => {
  const filetypes = /jpg|png|pdf|docx|xlsx/;
  // Dosya uzantısını kontrol et
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Dosya MIME tipini kontrol et
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Desteklenmeyen dosya formatı! (Sadece PDF, Resim, Word, Excel)'));
  }
};

// Multer Ayarlarını Birleştirme
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB limit 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;