const express = require('express');
const Subject = require('../models/subject');
const ChatHistory = require('../models/chatHistory');
const { queryChunks } = require('../services/vectorStore');
const { generateAnswer } = require('../services/gemini');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/chat/history/all — Get all chat histories for the user
router.get('/history/all', auth, async (req, res) => {
    try {
        const chatHistories = await ChatHistory.find({ userId: req.user.id })
            .sort({ updatedAt: -1 })
            .lean();

        // Fetch subject names for all histories
        const subjectIds = chatHistories.map(h => h.subjectId);
        const subjects = await Subject.find({ _id: { $in: subjectIds } }).lean();
        const subjectMap = {};
        subjects.forEach(s => { subjectMap[s._id.toString()] = s.name; });

        const result = chatHistories.map(h => {
            const lastMsg = h.messages && h.messages.length > 0
                ? h.messages[h.messages.length - 1]
                : null;
            return {
                _id: h._id,
                subjectId: h.subjectId,
                subjectName: subjectMap[h.subjectId.toString()] || 'Unknown Subject',
                lastMessage: lastMsg ? lastMsg.content.slice(0, 80) : '',
                lastMessageRole: lastMsg ? lastMsg.role : null,
                messageCount: h.messages ? h.messages.length : 0,
                updatedAt: h.updatedAt,
            };
        });

        return res.json(result);
    } catch (err) {
        console.error('[Chat History] Get all histories error:', err.message);
        return res.status(500).json({ message: 'Internal server error.', details: err.message });
    }
});

// POST /api/chat/:subjectId — Ask a question (RAG pipeline)
router.post('/:subjectId', auth, async (req, res) => {
    try {
        const { question } = req.body;

        if (!question || !question.trim()) {
            return res.status(400).json({ message: 'Question is required.' });
        }

        // Verify subject belongs to user
        const subject = await Subject.findOne({ _id: req.params.subjectId, userId: req.user.id });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found.' });
        }

        // 1. Retrieve relevant chunks from vector store
        const contextChunks = await queryChunks(req.params.subjectId, question, 5);
        console.log(`[Chat] Found ${contextChunks.length} relevant chunks`);

        // 2. Get or create chat history
        let chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            subjectId: req.params.subjectId,
        });

        if (!chatHistory) {
            chatHistory = await ChatHistory.create({
                userId: req.user.id,
                subjectId: req.params.subjectId,
                messages: [],
            });
        }

        // 3. Build history for multi-turn context (last 10 messages)
        const recentHistory = chatHistory.messages.slice(-10).map((msg) => ({
            role: msg.role,
            content: msg.content,
        }));

        // 4. Generate answer via Gemini
        console.log(`[Chat] Asking Gemini about "${question.slice(0, 50)}..."`);
        const answer = await generateAnswer(subject.name, question, contextChunks, recentHistory);
        console.log(`[Chat] Got answer, confidence: ${answer.confidence}`);

        // 5. Save messages to history
        chatHistory.messages.push({
            role: 'user',
            content: question,
        });

        chatHistory.messages.push({
            role: 'assistant',
            content: answer.answer,
            citations: answer.citations || [],
            confidence: answer.confidence || 'Low',
            evidence: answer.evidence || [],
        });

        await chatHistory.save();

        return res.json(answer);
    } catch (err) {
        console.error('[Chat] Chat error:', err.message);
        return res.status(500).json({ message: err.message || 'Internal server error.', details: err.message });
    }
});

// GET /api/chat/:subjectId/history — Get chat history
router.get('/:subjectId/history', auth, async (req, res) => {
    try {
        const chatHistory = await ChatHistory.findOne({
            userId: req.user.id,
            subjectId: req.params.subjectId,
        });

        return res.json(chatHistory ? chatHistory.messages : []);
    } catch (err) {
        console.error('[Chat] Get history error:', err.message);
        return res.status(500).json({ message: 'Internal server error.', details: err.message });
    }
});

// DELETE /api/chat/:subjectId/history — Clear chat history
router.delete('/:subjectId/history', auth, async (req, res) => {
    try {
        await ChatHistory.findOneAndDelete({
            userId: req.user.id,
            subjectId: req.params.subjectId,
        });

        return res.json({ message: 'Chat history cleared.' });
    } catch (err) {
        console.error('Clear history error:', err);
        return res.status(500).json({ message: 'Internal server error.' });
    }
});

module.exports = router;
