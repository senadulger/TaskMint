const asyncHandler = require('express-async-handler');
const Task = require('../models/Task'); // Task modelimizi import ediyoruz
const mongoose = require('mongoose');

// @desc    Kullanıcının tüm görevlerini listele
// @route   GET /api/tasks
// @access  Private (Giriş Gerekli)
const getTasks = asyncHandler(async (req, res) => {
  // Sadece giriş yapan kullanıcının görevlerini bul
  // req.user, bizim authMiddleware'den (protect) geliyor
  const tasks = await Task.find({ user: req.user._id });
  res.json(tasks);
});

// @desc    Yeni bir görev oluştur
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, status, dueDate, dueTime } = req.body;

  if (!title || !category || !status) {
    res.status(400);
    throw new Error('Lütfen başlık, kategori ve durum alanlarını doldurun');
  }

  const task = new Task({
    user: req.user._id, // Görevi giriş yapan kullanıcıya ata
    title,
    description,
    category,
    status,
    dueDate,
    dueTime,
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask); // 201 = Başarıyla Oluşturuldu
});

// @desc    Bir görevi güncelle
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404); // 404 Bulunamadı
    throw new Error('Görev bulunamadı');
  }

  // Güvenlik: Görev, bu kullanıcıya mı ait?
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401); // Yetkisiz
    throw new Error('Bu görevi güncellemeye yetkiniz yok');
  }

  // Görevi yeni verilerle güncelle
  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  task.category = req.body.category || task.category;
  task.status = req.body.status || task.status;
  task.dueDate = req.body.dueDate || task.dueDate;
  task.dueTime = req.body.dueTime || task.dueTime;

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// @desc    Bir görevi sil
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    res.status(404);
    throw new Error('Görev bulunamadı');
  }

  // Güvenlik: Görev, bu kullanıcıya mı ait?
  if (task.user.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('Bu görevi silmeye yetkiniz yok');
  }

  await task.deleteOne(); // Görevi sil
  res.json({ message: 'Görev başarıyla silindi' });
});

// @desc    Kullanıcının görev istatistiklerini al
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  // 1. Sadece giriş yapmış kullanıcıya ait görevleri bul
  const matchStage = {
    $match: { user: new mongoose.Types.ObjectId(req.user._id) },
  };

  // 2. Görevleri önce kategoriye, sonra duruma göre grupla ve say
  const groupStage1 = {
    $group: {
      _id: {
        category: '$category',
        status: '$status',
      },
      count: { $sum: 1 },
    },
  };

  // 3. Çıktıyı tekrar kategoriye göre grupla
  //    ve durum/sayı bilgilerini bir diziye at
  const groupStage2 = {
    $group: {
      _id: '$_id.category', // Kategoriye göre grupla
      statuses: {
        $push: {
          status: '$_id.status',
          count: '$count',
        },
      },
      totalTasks: { $sum: '$count' }, // Bu kategorideki toplam görev sayısı
    },
  };

  // 4. Çıktının adını "category" olarak değiştir
  const projectStage = {
    $project: {
      _id: 0, // _id alanını kaldır
      category: '$_id', // _id'nin adını 'category' yap
      statuses: 1,
      totalTasks: 1,
    },
  };

  // 5. Aggregation Pipeline'ı çalıştır
  const stats = await Task.aggregate([
    matchStage,
    groupStage1,
    groupStage2,
    projectStage,
  ]);

  if (!stats) {
    res.status(404);
    throw new Error('İstatistik bulunamadı');
  }

  res.json(stats);
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
};