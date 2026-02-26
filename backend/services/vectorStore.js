const Chunk = require('../models/chunk');

/**
 * Persist chunks to MongoDB instead of in-memory.
 */
async function addChunks(subjectId, chunks, noteId) {
    const docs = chunks.map((c, i) => ({
        subjectId,
        noteId,
        content: c.content,
        metadata: { ...c.metadata, noteId },
    }));
    await Chunk.insertMany(docs);
    console.log(`[VectorStore] Persisted ${chunks.length} chunks to MongoDB for subject ${subjectId}`);
}

/**
 * Query for the most relevant chunks using MongoDB text search.
 */
async function queryChunks(subjectId, query, topK = 5) {
    // Basic text search in MongoDB
    const chunks = await Chunk.find(
        { subjectId, $text: { $search: query } },
        { score: { $meta: "textScore" } }
    )
        .sort({ score: { $meta: "textScore" } })
        .limit(topK);

    // fall back to loading most recent chunks if text search returns nothing
    if (chunks.length === 0) {
        return await Chunk.find({ subjectId }).sort({ createdAt: -1 }).limit(topK);
    }

    return chunks.map(c => ({
        content: c.content,
        metadata: c.metadata
    }));
}

/**
 * Remove all chunks belonging to a specific note.
 */
async function removeNoteChunks(subjectId, noteId) {
    await Chunk.deleteMany({ subjectId, noteId });
}

/**
 * Delete the entire collection for a subject.
 */
async function deleteSubjectCollection(subjectId) {
    await Chunk.deleteMany({ subjectId });
}

module.exports = {
    addChunks,
    queryChunks,
    removeNoteChunks,
    deleteSubjectCollection,
};
