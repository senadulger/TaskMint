const multer = require('multer');
const path = require('path');

// 1. Dosyanın Nereye ve Hangi İsimle Kaydedileceği
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Dosyalar ana dizindeki 'uploads' klasörüne kaydedilecek
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename(req, file, cb) {
    // Çakışmayı önlemek için ismin başına tarih ekliyoruz
    // Örn: 173123456-rapor.pdf
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// 2. Dosya Formatı Kontrolü (Gereksinim 8.1)
// Supported: PDF, PNG, JPG, DOCX, XLSX
const checkFileType = (file, cb) => {
  const filetypes = /jpg|jpeg|png|pdf|doc|docx|xls|xlsx/;
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

// 3. Multer Ayarlarını Birleştirme
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10 MB limit 
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

module.exports = upload;