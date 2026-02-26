const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

/**
 * Parse a file (PDF or TXT) and return raw text with page info.
 * @param {string} filePath - Absolute path to the uploaded file.
 * @param {string} originalName - Original filename.
 * @returns {Promise<{text: string, pages: Array<{page: number, text: string}>}>}
 */
async function parseFile(filePath, originalName) {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.pdf') {
        return parsePDF(filePath, originalName);
    }

    if (ext === '.txt') {
        return parseTXT(filePath);
    }

    throw new Error(`Unsupported file type: ${ext}. Only PDF and TXT are supported.`);
}

async function parsePDF(filePath) {
    const buffer = fs.readFileSync(filePath);

    // pdf-parse v2 uses a class-based API
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const data = await parser.getText();
    const rawText = typeof data === 'string' ? data : (data?.text || '');

    // Attempt page splitting via form-feed characters
    const rawPages = rawText.split('\\f').filter((p) => p.trim().length > 0);
    const pages = rawPages.map((text, i) => ({ page: i + 1, text: text.trim() }));

    return {
        text: rawText,
        pages: pages.length > 0 ? pages : [{ page: 1, text: rawText }],
    };
}

async function parseTXT(filePath) {
    const text = fs.readFileSync(filePath, 'utf-8');
    return {
        text,
        pages: [{ page: 1, text }],
    };
}

// --- Chunking ---

const DEFAULT_CHUNK_SIZE = 500;
const DEFAULT_CHUNK_OVERLAP = 50;

/**
 * Recursively chunk text into overlapping segments with metadata.
 * @param {Array<{page: number, text: string}>} pages
 * @param {string} filename - Source filename for metadata.
 * @param {object} options
 * @param {number} [options.chunkSize=500]
 * @param {number} [options.chunkOverlap=50]
 * @returns {Array<{content: string, metadata: {filename: string, page: number, chunkIndex: number}}>}
 */
function chunkPages(pages, filename, options = {}) {
    const chunkSize = options.chunkSize || DEFAULT_CHUNK_SIZE;
    const chunkOverlap = options.chunkOverlap || DEFAULT_CHUNK_OVERLAP;
    const chunks = [];
    let globalIndex = 0;

    for (const { page, text } of pages) {
        const pageChunks = splitText(text, chunkSize, chunkOverlap);
        for (const content of pageChunks) {
            chunks.push({
                content,
                metadata: {
                    filename,
                    page,
                    chunkIndex: globalIndex++,
                },
            });
        }
    }

    return chunks;
}

/**
 * Split text into overlapping chunks.
 * @param {string} text
 * @param {number} size
 * @param {number} overlap
 * @returns {string[]}
 */
function splitText(text, size, overlap) {
    const chunks = [];
    if (!text || text.length === 0) return chunks;

    let start = 0;
    while (start < text.length) {
        const end = Math.min(start + size, text.length);
        const chunk = text.slice(start, end).trim();
        if (chunk.length > 0) {
            chunks.push(chunk);
        }
        if (end >= text.length) break;
        start += size - overlap;
    }

    return chunks;
}

module.exports = {
    parseFile,
    chunkPages,
};
