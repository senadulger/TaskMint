const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// @desc    Kullanıcının görevlerini (Admin ise hepsini) listeleme
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  let tasks;

  // --- ADMIN KONTROLÜ ---
  // Admin ise veritabanındaki TÜM görevleri görebilir.
  if (req.user.role === 'admin') {
    tasks = await Task.find().populate('user', 'name email').populate('assignedTo', 'name email');
  } else {
    // Normal kullanıcı ise sadece KENDİ oluşturduğu veya KENDİSİNE ATANAN görevleri görür
    tasks = await Task.find({
      $or: [
        { user: req.user._id },       // Oluşturan benim
        { assignedTo: req.user._id }  // Veya bana atanmış
      ]
    }).populate('assignedTo', 'name');
  }
 

  res.json(tasks);
});

// @desc    Görev oluşturma (+ Dosya Yükleme)
// @route   POST /api/tasks
// @access  Private
const createTask = asyncHandler(async (req, res) => {
  const { title, description, category, status, dueDate, dueTime, assignedTo } = req.body;

  if (!title || !category || !status) {
    return res.status(400).json({ message: 'Please provide title, category, and status' });
  }

  // --- DOSYA İŞLEME  ---
  // Multer tarafından yüklenen dosyaları şemaya uygun hale getiriyoruz .
  let attachments = [];
  if (req.files && req.files.length > 0) {
    attachments = req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype.split('/')[1] || 'unknown',
      fileSize: file.size,
      uploader: req.user._id // Dosyayı kim yükledi? 
    }));
  }

  const task = new Task({
    user: req.user._id,
    title,
    description,
    category,
    status,
    dueDate,
    dueTime,
    attachments, // Dosyaları ekle
    // Admin ise başkasına görev atayabilir, değilse bu alan null kalır
    assignedTo: req.user.role === 'admin' && assignedTo ? assignedTo : null 
  });

  const createdTask = await task.save();
  res.status(201).json(createdTask);
});

// @desc    Görev güncelleme (+ Dosya Ekleme)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // --- YETKİ KONTROLÜ ---
  // Sadece Admin veya görevin sahibi güncelleyebilir
  // Ayrıca görev sana atandıysa (assignedTo) durumunu güncelleyebilmelisin
  const isOwner = task.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isAssigned) {
    return res.status(401).json({ message: 'Not authorized to update this task' });
  }

  // --- YENİ DOSYALARI EKLEME ---
  // Mevcut dosyalara dokunmadan yenileri ekliyoruz (push)
  if (req.files && req.files.length > 0) {
    const newAttachments = req.files.map(file => ({
      fileName: file.originalname,
      filePath: file.path,
      fileType: file.mimetype.split('/')[1] || 'unknown',
      fileSize: file.size,
      uploader: req.user._id
    }));
    // Veritabanındaki attachments dizisine yenileri ekle
    task.attachments.push(...newAttachments);
  }

  task.title = req.body.title || task.title;
  task.description = req.body.description || task.description;
  task.category = req.body.category || task.category;
  task.status = req.body.status || task.status;
  task.dueDate = req.body.dueDate || task.dueDate;
  task.dueTime = req.body.dueTime || task.dueTime;
  
  // Admin ise atamayı değiştirebilir
  if (isAdmin && req.body.assignedTo) {
      task.assignedTo = req.body.assignedTo;
  }

  const updatedTask = await task.save();
  res.json(updatedTask);
});

// @desc    Görev silme
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // --- YETKİ KONTROLÜ ---
  // Admin herkesin görevini silebilir, kullanıcı sadece kendisininkini.
  if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Not authorized to delete this task' });
  }

  // Not: Dosyaları diskten silme işlemi (fs.unlink) buraya eklenebilir, 
  // ancak şimdilik veritabanından silmek yeterli olacaktır.
  await task.deleteOne();
  res.json({ message: 'Task successfully deleted' });
});

// @desc    İstatistikleri getirme
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  // Admin ise tüm sistemin istatistikleri, değilse sadece kendi istatistikleri
  let matchQuery = { user: new mongoose.Types.ObjectId(req.user._id) };
  
  if (req.user.role === 'admin') {
      matchQuery = {}; // Filtre yok, hepsini al
  }

  const stats = await Task.aggregate([
    {
      $match: matchQuery, // Güncellenmiş sorgu
    },
    {
      $group: {
        _id: {
          category: '$category',
          status: '$status',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.category',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count',
          },
        },
        totalTasks: { $sum: '$count' },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id',
        statuses: 1,
        totalTasks: 1,
      },
    },
  ]);

  if (!stats) {
    return res.status(404).json({ message: 'Statistics not found' });
  }
  res.json(stats);
});

// @desc    Görevin içinden dosya silme
// @route   DELETE /api/tasks/:id/attachments/:attachmentId
// @access  Private
const deleteAttachment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }

  // Yetki Kontrolü: Sadece sahibi veya Admin silebilir
  if (task.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(401).json({ message: 'Not authorized' });
  }

  // Silinecek dosyayı bul
  const attachment = task.attachments.id(req.params.attachmentId);
  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  // 1. Dosyayı fiziksel olarak diskten (uploads klasöründen) sil
  // Not: 'fs' modülünün import edildiğinden emin ol (const fs = require('fs');)
  if (attachment.filePath) {
    const absolutePath = path.join(__dirname, '..', attachment.filePath); 
    // filePath 'uploads\dosya.pdf' gibi geldiği için path'i düzeltiyoruz
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }
  }

  // 2. Dosyayı veritabanı dizisinden çıkar
  task.attachments.pull(req.params.attachmentId);
  await task.save();

  res.json({ message: 'File removed' });
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  deleteAttachment
};