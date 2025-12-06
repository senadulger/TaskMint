const mongoose = require('mongoose');

//Görevlerin veritabanı şeması
const taskSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'User', 
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null 
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
      enum: ['Incomplete', 'In Progress', 'Completed'],
      default: 'Incomplete', 
    },

    dueDate: {
      type: Date,
      required: false,
    },

    dueTime: {
      type: String,
      required: false,
    },

    // Attachment Module
    attachments: [
      {
        fileName: { type: String, required: true }, 
        filePath: { type: String, required: true }, 
        fileType: { type: String },                 // pdf, jpg vb. 
        fileSize: { type: Number },                 // Dosya boyutu 
        uploader: {                                 // Dosyayı yükleyen kullanıcı 
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        uploadDate: {                               // Yükleme tarihi 
            type: Date,
            default: Date.now
        }
      }
    ]

  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Task', taskSchema);