const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
    {
        subjectId: {
            type: String,
            required: true,
            index: true,
        },
        noteId: {
            type: String,
            required: true,
            index: true,
        },
        content: {
            type: String,
            required: true,
        },
        metadata: {
            filename: String,
            page: Number,
            chunkIndex: Number,
        },
    },
    { timestamps: true }
);

// Add a text index for basic RAG search
chunkSchema.index({ content: 'text' });

const Chunk = mongoose.model('Chunk', chunkSchema);

module.exports = Chunk;
