const express = require('express');
const Subject = require('../models/subject');
const { deleteSubjectCollection } = require('../services/vectorStore');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/subjects — Create a new subject (max 3)
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Subject name is required.' });
        }

        const count = await Subject.countByUser(req.user.id);
        if (count >= 20) {
            return res.status(400).json({ message: 'You can create a maximum of 20 subjects.' });
        }

        const subject = await Subject.create({
            userId: req.user.id,
            name: name.trim(),
        });

        return res.status(201).json(subject);
    } catch (err) {
        console.error('Create subject error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/subjects — List all subjects for the user
router.get('/', auth, async (req, res) => {
    try {
        const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });
        return res.json(subjects);
    } catch (err) {
        console.error('List subjects error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// GET /api/subjects/:id — Get a single subject
router.get('/:id', auth, async (req, res) => {
    try {
        const subject = await Subject.findOne({ _id: req.params.id, userId: req.user.id });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        return res.json(subject);
    } catch (err) {
        console.error('Get subject error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE /api/subjects/:id — Delete a subject and its vectors
router.delete('/:id', auth, async (req, res) => {
    try {
        const subject = await Subject.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // Clean up vector store
        await deleteSubjectCollection(req.params.id);

        return res.json({ message: 'Subject deleted successfully.' });
    } catch (err) {
        console.error('Delete subject error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
