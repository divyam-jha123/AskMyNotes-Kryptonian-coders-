const express = require('express');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const cloudinary = require('../config/cloudinary');
const Subject = require('../models/subject');
const { parseFile, chunkPages } = require('../services/pdfParser');
const { addChunks, removeNoteChunks } = require('../services/vectorStore');
const auth = require('../middleware/auth');

const router = express.Router();

// Use Memory Storage for Vercel / serverless environments
const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.txt'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and TXT files are allowed.'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (Note: Vercel has a 4.5MB request limit)
});

/**
 * Upload a buffer to Cloudinary using a stream.
 */
function uploadToCloudinary(buffer, options) {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
        uploadStream.end(buffer);
    });
}

// POST /api/notes/:subjectId/upload — Upload, parse, embed, store in Cloudinary
router.post('/:subjectId/upload', auth, upload.single('file'), async (req, res) => {
    try {
        console.log(`[Upload] Start: Subject ${req.params.subjectId}`);

        const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user.id });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        const originalName = req.file.originalname;
        const noteId = uuidv4();

        console.log(`[Upload] Processing "${originalName}" (${req.file.size} bytes)`);

        // 1. Parse file from buffer
        const { pages } = await parseFile(req.file.buffer, originalName);
        console.log(`[Upload] Parsed ${pages.length} page(s)`);

        // 2. Chunk the text
        const chunks = chunkPages(pages, originalName);
        console.log(`[Upload] Created ${chunks.length} chunk(s)`);

        if (chunks.length === 0) {
            return res.status(400).json({ message: 'Could not extract any text from the file.' });
        }

        // 3. Upload to Cloudinary via stream
        let cloudinaryUrl = null;
        let cloudinaryPublicId = null;
        try {
            const cloudinaryResult = await uploadToCloudinary(req.file.buffer, {
                resource_type: 'raw',
                folder: `askmynotes/${req.user.id}/${req.params.subjectId}`,
                public_id: noteId,
                original_filename: originalName,
            });
            cloudinaryUrl = cloudinaryResult.secure_url;
            cloudinaryPublicId = cloudinaryResult.public_id;
            console.log(`[Upload] Cloudinary OK: ${cloudinaryUrl}`);
        } catch (cloudErr) {
            console.warn('[Upload] Cloudinary failed:', cloudErr.message);
            // We continue anyway, as the RAG logic is more important
        }

        // 4. Embed chunks and store in MongoDB
        await addChunks(req.params.subjectId, chunks, noteId);
        console.log(`[Upload] Persisted chunks in vector store`);

        // 5. Save note reference to subject
        subject.notes.push({
            _id: noteId,
            filename: originalName,
            originalName,
            cloudinaryUrl,
            cloudinaryPublicId,
        });
        await subject.save();

        console.log(`[Upload] Success — noteId: ${noteId}`);

        return res.status(201).json({
            message: 'Note uploaded and processed successfully.',
            noteId,
            originalName,
            cloudinaryUrl,
            chunksCreated: chunks.length,
        });
    } catch (err) {
        console.error('[Upload] Fatal Error:', err);
        return res.status(500).json({ message: err.message || 'Internal server error during upload.' });
    }
});

// GET /api/notes/:subjectId — List notes for a subject
router.get('/:subjectId', auth, async (req, res) => {
    try {
        const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user.id });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }
        return res.json(subject.notes);
    } catch (err) {
        console.error('[Notes] List error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

// DELETE /api/notes/:subjectId/:noteId — Delete note
router.delete('/:subjectId/:noteId', auth, async (req, res) => {
    try {
        const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user.id });
        if (!subject) return res.status(404).json({ message: 'Subject not found.' });

        const noteIndex = subject.notes.findIndex((n) => n._id.toString() === req.params.noteId);
        if (noteIndex === -1) return res.status(404).json({ message: 'Note not found.' });

        const note = subject.notes[noteIndex];

        // Remove from Cloudinary
        if (note.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(note.cloudinaryPublicId, { resource_type: 'raw' });
            } catch (cloudErr) {
                console.error('[Notes] Cloudinary delete error:', cloudErr);
            }
        }

        // Remove chunks from MongoDB
        await removeNoteChunks(req.params.subjectId, req.params.noteId);

        // Remove from subject
        subject.notes.splice(noteIndex, 1);
        await subject.save();

        return res.json({ message: 'Note deleted successfully.' });
    } catch (err) {
        console.error('[Notes] Delete error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
