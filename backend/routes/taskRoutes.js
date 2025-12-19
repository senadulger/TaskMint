const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  deleteAttachment,
  getAttachment
} = require('../controllers/taskController');

const { protect } = require('../middleware/authMiddleware');

// GET /api/tasks (Tüm görevleri listele)
// POST /api/tasks (Yeni görev ekle)
router.route('/')
  .get(protect, getTasks)
  .post(protect, upload.array('attachments'), createTask);

// GET /api/tasks/stats (İstatistikleri al)
router.route('/stats').get(protect, getTaskStats);

// Veritabanından dosya çekme route'u
router.get('/attachments/:id', getAttachment);

// PUT /api/tasks/:id (Görevi güncelle)
// DELETE /api/tasks/:id (Görevi sil)
router
  .route('/:id')
  .put(protect, upload.array('attachments'), updateTask)
  .delete(protect, deleteTask);

router
  .route('/:id/attachments/:attachmentId')
  .delete(protect, deleteAttachment);

module.exports = router;