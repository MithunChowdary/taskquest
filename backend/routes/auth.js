const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            username,
            password: hashedPassword
        });

        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, username: user.username } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Daily reset and streak check on login
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const lastActiveStr = user.lastActive ? user.lastActive.toISOString().split('T')[0] : '';

        if (lastActiveStr !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (user.lastTargetDate !== yesterdayStr && user.lastTargetDate !== todayStr) {
                user.currentStreak = 0;
            }
            user.todayScore = 0;
            user.lastActive = today;
            await user.save();
        }

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                totalScore: user.totalScore,
                todayScore: user.todayScore,
                currentStreak: user.currentStreak,
                dailyTarget: user.dailyTarget,
                preferredTone: user.preferredTone
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update Profile
router.patch('/update-profile', async (req, res) => {
    const { userId, username, dailyTarget } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (username && username !== user.username) {
            const existingUser = await User.findOne({ username });
            if (existingUser) return res.status(400).json({ message: 'Hero name already taken' });
            user.username = username;
        }
        if (dailyTarget !== undefined) user.dailyTarget = dailyTarget;

        await user.save();
        res.json({ username: user.username, dailyTarget: user.dailyTarget });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get Current User
router.get('/me/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const lastActiveStr = user.lastActive ? user.lastActive.toISOString().split('T')[0] : '';

        if (lastActiveStr !== todayStr) {
            // It's a new day! Check if they broke their streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (user.lastTargetDate !== yesterdayStr && user.lastTargetDate !== todayStr) {
                // They didn't hit the target yesterday (and haven't already hit it today)
                user.currentStreak = 0;
            }

            user.todayScore = 0;
            user.lastActive = today;
            await user.save();
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
