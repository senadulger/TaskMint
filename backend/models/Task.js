// models/Task.js

const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    // Hangi kullanıcıya ait olduğunu belirtmek için
    user: {
      type: mongoose.Schema.Types.ObjectId, // User modelinin ID'si
      required: true,
      ref: 'User', // 'User' modeli ile ilişkilendir
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    category: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      // 'enum' sadece bu değerleri kabul eder
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending', // Varsayılan değer
    },
    dueDate: {
      type: Date,
      required: false,
    },
    dueTime: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);