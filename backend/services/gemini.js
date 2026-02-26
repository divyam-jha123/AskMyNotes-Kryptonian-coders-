const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Generation ---

const generationModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

/**
 * Retry a function on 429 rate limit errors with exponential backoff.
 */
async function withRetry(fn, maxRetries = 2) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (err) {
            if (err.status === 429 && attempt < maxRetries) {
                const waitSec = Math.pow(2, attempt + 1) * 5; // 10s, 20s
                console.log(`[Gemini] Rate limited, waiting ${waitSec}s before retry...`);
                await new Promise((r) => setTimeout(r, waitSec * 1000));
            } else {
                throw err;
            }
        }
    }
}

/**
 * Extract JSON from a response that may be wrapped in markdown code fences.
 */
function extractJSON(text) {
    let cleaned = text.trim();

    // 1. Try stripping markdown fences
    const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) {
        cleaned = fenceMatch[1].trim();
    }

    try {
        return JSON.parse(cleaned);
    } catch (e) {
        // 2. Fallback: Find first '{' and last '}'
        const firstBrace = cleaned.indexOf('{');
        const lastBrace = cleaned.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            try {
                return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
            } catch (innerError) {
                throw innerError;
            }
        }
        throw e;
    }
}

const QA_SYSTEM_PROMPT = `You are a study assistant for the subject "{subject}".
Answer ONLY using the provided context from the student's notes.
If the context is insufficient to answer the question, respond with EXACTLY this JSON:
{"answer":"Not found in your notes for {subject}.","citations":[],"confidence":"Low","evidence":[]}

Otherwise, return a JSON object with these fields:
- "answer": A clear, helpful answer derived strictly from the context.
- "citations": An array of objects, each with "file" (string), "page" (number or null), "chunk" (number).
- "confidence": One of "High", "Medium", or "Low" based on how well the context supports the answer.
- "evidence": An array of relevant verbatim snippets from the context that support the answer.

Return ONLY valid JSON. No markdown fences, no extra text.`;

/**
 * Generate a grounded answer using retrieved context chunks.
 * @param {string} subject - The subject name.
 * @param {string} question - The user's question.
 * @param {Array<{content: string, metadata: object}>} contextChunks - Retrieved chunks.
 * @param {Array<{role: string, content: string}>} chatHistory - Previous messages.
 * @returns {Promise<object>}
 */
async function generateAnswer(subject, question, contextChunks, chatHistory = []) {
    const systemPrompt = QA_SYSTEM_PROMPT.replaceAll('{subject}', subject);

    const contextText = contextChunks
        .map((c, i) => {
            const meta = c.metadata || {};
            return `[Chunk ${i + 1} | File: ${meta.filename || 'unknown'} | Page: ${meta.page ?? 'N/A'}]\n${c.content}`;
        })
        .join('\n\n---\n\n');

    // Build conversation history for multi-turn
    const historyMessages = chatHistory.map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
    }));

    const chat = generationModel.startChat({
        history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I will answer only from the provided context and return valid JSON.' }] },
            ...historyMessages,
        ],
    });

    const prompt = `CONTEXT:\n${contextText}\n\nQUESTION: ${question}`;
    const result = await withRetry(() => chat.sendMessage(prompt));
    const text = result.response.text().trim();
    console.log('[Gemini QA] Raw response:', text.slice(0, 200));

    try {
        return extractJSON(text);
    } catch {
        // If Gemini didn't return valid JSON, wrap the raw text
        return {
            answer: text,
            citations: [],
            confidence: 'Low',
            evidence: [],
        };
    }
}

// --- Study Mode ---

const STUDY_SYSTEM_PROMPT = `You are a study question generator for the subject "{subject}".
Using ONLY the provided context from student notes, generate study questions.

Return ONLY a valid JSON object with these fields:
- "mcqs": An array of exactly 5 multiple-choice questions, each with:
  - "question": The question text.
  - "options": An array of 4 option strings ["A. ...", "B. ...", "C. ...", "D. ..."].
  - "correct": The correct option letter ("A", "B", "C", or "D").
  - "explanation": A brief explanation of the correct answer.
  - "citation": An object with "file" (string), "page" (number or null), "chunk" (number).
- "shortAnswers": An array of exactly 3 short-answer questions, each with:
  - "question": The question text.
  - "expectedAnswer": A concise expected answer.
  - "citation": An object with "file" (string), "page" (number or null), "chunk" (number).

Return ONLY valid JSON. No markdown fences, no extra text.`;

/**
 * Generate study questions from context chunks.
 * @param {string} subject
 * @param {Array<{content: string, metadata: object}>} contextChunks
 * @returns {Promise<object>}
 */
async function generateStudyQuestions(subject, contextChunks) {
    const systemPrompt = STUDY_SYSTEM_PROMPT.replaceAll('{subject}', subject);

    const contextText = contextChunks
        .map((c, i) => {
            const meta = c.metadata || {};
            return `[Chunk ${i + 1} | File: ${meta.filename || 'unknown'} | Page: ${meta.page ?? 'N/A'}]\n${c.content}`;
        })
        .join('\n\n---\n\n');

    const chat = generationModel.startChat({
        history: [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Understood. I will generate study questions from the context and return valid JSON.' }] },
        ],
    });

    const result = await withRetry(() => chat.sendMessage(`CONTEXT:\n${contextText}\n\nGenerate study questions now.`));
    const text = result.response.text().trim();
    console.log('[Gemini Study] Raw response:', text.slice(0, 200));

    try {
        return extractJSON(text);
    } catch {
        return { mcqs: [], shortAnswers: [], raw: text };
    }
}

module.exports = {
    generateAnswer,
    generateStudyQuestions,
};
