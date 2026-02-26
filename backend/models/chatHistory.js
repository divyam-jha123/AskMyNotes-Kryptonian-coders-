const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true,
    },
    content: { type: String, required: true },
    citations: { type: Array, default: [] },
    confidence: { type: String, default: null },
    evidence: { type: Array, default: [] },
    timestamp: { type: Date, default: Date.now },
});

const chatHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        subjectId: {
            type: String,
            required: true,
        },
        messages: [messageSchema],
    },
    { timestamps: true }
);

// One chat history per user-subject pair
chatHistorySchema.index({ userId: 1, subjectId: 1 }, { unique: true });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

module.exports = ChatHistory;
