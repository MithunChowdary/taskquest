const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        default: ''
    },
    content: {
        type: String,
        required: true
    },
    category: {
        type: String,
        default: 'General'
    },
    color: {
        type: String,
        default: '#f97316'
    }
}, { timestamps: true });

module.exports = mongoose.models.Note || mongoose.model('Note', noteSchema);
