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
        console.error('[Subjects] Create error:', err.message);
        return res.status(500).json({ message: 'Internal server error.', details: err.message });
    }
});

// GET /api/subjects — List all subjects for the user
router.get('/', auth, async (req, res) => {
    try {
        console.log('[Subjects] Listing for user:', req.user.id);
        const subjects = await Subject.find({ userId: req.user.id }).sort({ createdAt: -1 });
        console.log(`[Subjects] Found ${subjects.length} subjects`);
        return res.json(subjects);
    } catch (err) {
        console.error('[Subjects] List error:', err.message);
        return res.status(500).json({ message: 'Internal server error.', details: err.message });
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
        console.error('[Subjects] Get specific error:', err.message);
        return res.status(500).json({ message: 'Internal server error.', details: err.message });
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
        console.error('[Subjects] Delete error:', err.message);
        return res.status(500).json({ message: 'Internal server error.', details: err.message });
    }
});

module.exports = router;
