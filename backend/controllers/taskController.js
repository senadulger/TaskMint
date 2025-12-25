const asyncHandler = require('express-async-handler');
const Task = require('../models/Task');
const Attachment = require('../models/Attachment');
const mongoose = require('mongoose');

// @desc    Kullanıcının görevlerini (Admin ise hepsini) listeleme
// @route   GET /api/tasks
// @access  Private
const getTasks = asyncHandler(async (req, res) => {
  let tasks;

  // --- ADMIN KONTROLÜ ---
  // Admin ise veritabanındaki tüm görevleri görebilir.
  if (req.user.role === 'admin') {
    tasks = await Task.find().populate('user', 'name email').populate('assignedTo', 'name email');
  } else {
    // Normal kullanıcı ise sadece kendi oluşturduğu veya kendisine atanmış görevleri görür
    tasks = await Task.find({
      $or: [
        { user: req.user._id },       // Oluşturan benim
        { assignedTo: req.user._id }  // Veya bana atanmış
      ]
    }).populate('assignedTo', 'name').populate('user', 'name');
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

  // --- VERİTABANI DOSYA İŞLEME ---
  // Önce Task nesnesini oluştur (ID'si olsun diye)
  const taskId = new mongoose.Types.ObjectId();

  let taskAttachments = [];

  // Dosya varsa Attachment koleksiyonuna kaydet
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const attachmentId = new mongoose.Types.ObjectId();
      const storagePath = `http://localhost:5050/api/tasks/attachments/${attachmentId}`;

      const attachment = new Attachment({
        _id: attachmentId,
        originalFileName: file.originalname,
        fileType: file.mimetype.split('/')[1] || 'unknown',
        fileData: file.buffer, // Binary data
        fileSize: file.size,
        uploaderUserId: req.user._id,
        taskId: taskId,
        storagePath: storagePath
      });

      const savedAttachment = await attachment.save();

      // Task içine eklenecek metadata
      taskAttachments.push({
        attachmentId: savedAttachment._id,
        originalFileName: savedAttachment.originalFileName,
        storagePath: savedAttachment.storagePath,
        fileType: savedAttachment.fileType,
        fileSize: savedAttachment.fileSize,
        uploaderUserId: savedAttachment.uploaderUserId
      });
    }
  }

  let finalAssignedTo = null;
  // Sadece admin ise assignedTo kullanabilir. Ayrıca boş string veya "null" string gelirse null yapalım.
  if (req.user.role === 'admin' && assignedTo && assignedTo !== 'null' && assignedTo !== 'undefined' && assignedTo !== '') {
    finalAssignedTo = assignedTo;
  }

  try {
    const task = new Task({
      _id: taskId,
      user: req.user._id,
      title,
      description,
      category,
      status,
      dueDate,
      dueTime,
      attachments: taskAttachments,
      assignedTo: finalAssignedTo
    });

    const createdTask = await task.save();
    console.log('Task created successfully with ID:', createdTask._id);
    res.status(201).json(createdTask);

  } catch (error) {
    console.error('Create Task Error (Details):', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message, error: error.errors });
    }
    res.status(500).json({ message: 'Server Error during task creation', error: error.message });
  }
});

// @desc    Görev güncelleme (+ Dosya Ekleme)
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = asyncHandler(async (req, res) => {
  console.log('updateTask called');
  console.log('body:', req.body);
  console.log('files:', req.files);
  const task = await Task.findById(req.params.id);

  try {
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // --- YETKİ KONTROLÜ ---
    const isOwner = task.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin && !isAssigned) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    // --- YENİ DOSYALARI EKLEME ---
    if (req.files && req.files.length > 0) {
      const newAttachments = [];
      for (const file of req.files) {
        const attachmentId = new mongoose.Types.ObjectId();
        const storagePath = `http://localhost:5050/api/tasks/attachments/${attachmentId}`;

        const attachment = new Attachment({
          _id: attachmentId,
          originalFileName: file.originalname,
          fileType: file.mimetype.split('/')[1] || 'unknown',
          fileData: file.buffer,
          fileSize: file.size,
          uploaderUserId: req.user._id,
          taskId: task._id,
          storagePath: storagePath
        });
        const saved = await attachment.save();
        newAttachments.push({
          attachmentId: saved._id,
          originalFileName: saved.originalFileName,
          storagePath: saved.storagePath,
          fileType: saved.fileType,
          fileSize: saved.fileSize,
          uploaderUserId: saved.uploaderUserId
        });
      }
      task.attachments.push(...newAttachments);
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.category = req.body.category || task.category;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.dueTime = req.body.dueTime || task.dueTime;

    // Admin ise atamayı değiştirebilir
    if (isAdmin) {
      // Eğer assignedTo boş string ise atamayı kaldır
      if (req.body.assignedTo === "") {
        task.assignedTo = null;
      } else if (req.body.assignedTo) {
        task.assignedTo = req.body.assignedTo;
      }
    }

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
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
  // Admin herkesin görevini silebilir, kullanıcı sadece kendisininkini veya kendisine atananı.
  const isOwner = task.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isAssigned) {
    return res.status(401).json({ message: 'Not authorized to delete this task' });
  }

  // --- DOSYALARI SİLME ---
  await Attachment.deleteMany({ taskId: req.params.id });

  await task.deleteOne();
  res.json({ message: 'Task and attachments successfully deleted' });
});

// @desc    İstatistikleri getirme
// @route   GET /api/tasks/stats
// @access  Private
const getTaskStats = asyncHandler(async (req, res) => {
  // Admin ise tüm sistemin istatistikleri, değilse sadece kendi istatistikleri
  let matchQuery = {
    $or: [
      { user: new mongoose.Types.ObjectId(req.user._id) },
      { assignedTo: new mongoose.Types.ObjectId(req.user._id) }
    ]
  };

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

  // Yetki Kontrolü: Sadece sahibi, Admin veya atanan kişi silebilir
  const isOwner = task.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  if (!isOwner && !isAdmin && !isAssigned) {
    return res.status(401).json({ message: 'Not authorized' });
  }

  const attachmentSubdoc = task.attachments.id(req.params.attachmentId);
  const realAttachmentId = attachmentSubdoc ? attachmentSubdoc.attachmentId : null;

  if (!attachmentSubdoc) {
    return res.status(404).json({ message: 'Attachment info not found in task' });
  }


  // Veritabanından (Attachment collection) sil
  if (realAttachmentId) {
    await Attachment.findByIdAndDelete(realAttachmentId);
  }

  // Dosyayı veritabanı dizisinden (Task) çıkar
  task.attachments.pull(req.params.attachmentId);
  await task.save();

  res.json({ message: 'File removed' });
});

// @desc    Dosyayı indir/görüntüle (Database'den)
// @route   GET /api/tasks/attachments/:id
// @access  Private (veya Public, ihtiyaca göre. Şuan Private yapalım)
const getAttachment = asyncHandler(async (req, res) => {
  const attachment = await Attachment.findById(req.params.id);

  if (!attachment) {
    return res.status(404).json({ message: 'Attachment not found' });
  }

  // MimeType belirleme
  let contentType = 'application/octet-stream';
  if (attachment.fileType === 'png') contentType = 'image/png';
  else if (attachment.fileType === 'jpg' || attachment.fileType === 'jpeg') contentType = 'image/jpeg';
  else if (attachment.fileType === 'pdf') contentType = 'application/pdf';
  else if (attachment.fileType === 'txt') contentType = 'text/plain';

  res.set('Content-Type', contentType);
  const filename = attachment.originalFileName || 'downloaded-file';
  res.set('Content-Disposition', `inline; filename="${encodeURIComponent(filename)}"`);

  res.send(attachment.fileData);
});

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
  deleteAttachment,
  getAttachment
};