const express = require('express');
const router = express.Router();
const Todo = require('../models/Todo');
const User = require('../models/User');

// Get all todos for a user
router.get('/:userId', async (req, res) => {
    try {
        const todos = await Todo.find({ userId: req.params.userId }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a todo
router.post('/', async (req, res) => {
    const { userId, text, difficulty } = req.body;

    const scoreMap = { easy: 5, medium: 10, hard: 20 };
    const scoreValue = scoreMap[difficulty] || 5;

    const todo = new Todo({
        userId,
        text,
        difficulty,
        scoreValue
    });

    try {
        const newTodo = await todo.save();
        res.status(201).json(newTodo);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Toggle todo completion
router.patch('/:id/toggle', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

        todo.isCompleted = !todo.isCompleted;
        if (todo.isCompleted) {
            todo.completedAt = new Date();
        } else {
            todo.completedAt = null;
        }

        const updatedTodo = await todo.save();

        const user = await User.findById(todo.userId);
        if (user) {
            const today = new Date();
            const todayStr = today.toISOString().split('T')[0];

            // Calculate actual todayScore from tasks completed today
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);

            const allUserTodos = await Todo.find({ userId: user._id });

            const todayScore = allUserTodos
                .filter(t => t.isCompleted && t.completedAt && new Date(t.completedAt) >= startOfDay)
                .reduce((acc, t) => acc + (t.scoreValue || 0), 0);

            const totalScore = allUserTodos
                .filter(t => t.isCompleted)
                .reduce((acc, t) => acc + (t.scoreValue || 0), 0);

            user.todayScore = todayScore;
            user.totalScore = totalScore;
            user.tasksCompleted = allUserTodos.filter(t => t.isCompleted).length;

            // 2. Streak Logic
            if (user.todayScore >= user.dailyTarget) {
                if (user.lastTargetDate !== todayStr) {
                    const yesterday = new Date();
                    yesterday.setDate(yesterday.getDate() - 1);
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    if (user.lastTargetDate === yesterdayStr) {
                        user.currentStreak += 1;
                    } else {
                        user.currentStreak = 1;
                    }
                    user.lastTargetDate = todayStr;
                }
            } else if (user.todayScore < user.dailyTarget && user.lastTargetDate === todayStr) {
                user.currentStreak = Math.max(0, user.currentStreak - 1);
                user.lastTargetDate = null;
            }

            user.lastActive = today;
            await user.save();

            return res.json({
                todo: updatedTodo,
                user: {
                    todayScore: user.todayScore,
                    totalScore: user.totalScore,
                    currentStreak: user.currentStreak,
                    tasksCompleted: user.tasksCompleted,
                    lastTargetDate: user.lastTargetDate
                }
            });
        }

        res.json({ todo: updatedTodo });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a todo
router.delete('/:id', async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) return res.status(404).json({ message: 'Todo not found' });

        await Todo.findByIdAndDelete(req.params.id);
        res.json({ message: 'Todo deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
