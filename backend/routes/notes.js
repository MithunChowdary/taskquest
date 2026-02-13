const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

// Get all notes for a user
router.get('/:userId', async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.params.userId }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new note
router.post('/', async (req, res) => {
    const { userId, title, content, category, color } = req.body;
    const note = new Note({
        userId,
        title,
        content,
        category,
        color
    });

    try {
        const newNote = await note.save();
        res.status(201).json(newNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update a note
router.patch('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        if (req.body.title !== undefined) note.title = req.body.title;
        if (req.body.content !== undefined) note.content = req.body.content;
        if (req.body.category !== undefined) note.category = req.body.category;
        if (req.body.color !== undefined) note.color = req.body.color;

        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a note
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) return res.status(404).json({ message: 'Note not found' });

        await note.deleteOne();
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
