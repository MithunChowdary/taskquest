const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'easy' },
    scoreValue: { type: Number, default: 5 },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);
