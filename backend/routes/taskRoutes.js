const express = require('express');
const router = express.Router();

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware'); // Koruma katmanımız

// router.route() zincirleme yöntemi, aynı URL'ye giden
// farklı metodları (GET, POST) tek seferde tanımlamamızı sağlar.

// GET /api/tasks (Tüm görevleri listele)
// POST /api/tasks (Yeni görev ekle)
router.route('/').get(protect, getTasks).post(protect, createTask);

// GET /api/tasks/stats (İstatistikleri al)
// ÖNEMLİ: Bu satır '/:id' rotasından önce gelmeli!
router.route('/stats').get(protect, getTaskStats);

// PUT /api/tasks/:id (Görevi güncelle)
// DELETE /api/tasks/:id (Görevi sil)
router
  .route('/:id')
  .put(protect, updateTask)
  .delete(protect, deleteTask);

module.exports = router;