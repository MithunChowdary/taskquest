const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    totalScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    lastTargetDate: { type: String }, // Format: YYYY-MM-DD
    todayScore: { type: Number, default: 0 },
    dailyTarget: { type: Number, default: 50 },
    preferredTone: { type: String, enum: ['friendly', 'neutral', 'rude'], default: 'neutral' },
    tasksCompleted: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
