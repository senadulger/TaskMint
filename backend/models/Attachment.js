const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    originalFileName: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileData: {
        type: Buffer,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploaderUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    taskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
        required: true
    },
    storagePath: {
        type: String,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Attachment', attachmentSchema);
