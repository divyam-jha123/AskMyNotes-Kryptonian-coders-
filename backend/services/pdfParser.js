const path = require('path');
const pdfjsLib = require('pdfjs-dist/build/pdf');

// Disable worker if not in a worker environment
if (typeof window === 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    // In Node.js, we don't need a separate worker file if we're just parsing text
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
}

/**
 * Parse a file (PDF or TXT) from a Buffer and return raw text with page info.
 * @param {Buffer} buffer - File content.
 * @param {string} originalName - Original filename.
 * @returns {Promise<{text: string, pages: Array<{page: number, text: string}>}>}
 */
async function parseFile(buffer, originalName) {
    const ext = path.extname(originalName).toLowerCase();

    if (ext === '.pdf') {
        return parsePDFFromBuffer(buffer);
    }

    if (ext === '.txt') {
        return parseTXTFromBuffer(buffer);
    }

    throw new Error(`Unsupported file type: ${ext}. Only PDF and TXT are supported.`);
}

async function parsePDFFromBuffer(buffer) {
    try {
        const data = new Uint8Array(buffer);
        const loadingTask = pdfjsLib.getDocument({
            data,
            useSystemFonts: true,
            disableFontFace: true,
            verbosity: 0 // Suppress warnings
        });

        const pdf = await loadingTask.promise;
        const numPages = pdf.numPages;
        const pages = [];
        let fullText = '';

        for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map(item => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (pageText) {
                pages.push({ page: i, text: pageText });
                fullText += (fullText ? '\n\n' : '') + pageText;
            }
        }

        return {
            text: fullText,
            pages: pages.length > 0 ? pages : [{ page: 1, text: fullText || 'No text content found in PDF.' }],
        };
    } catch (err) {
        console.error('[PDF Parser] pdfjs-dist error:', err);
        throw new Error(`Failed to parse PDF: ${err.message}`);
    }
}

async function parseTXTFromBuffer(buffer) {
    const text = buffer.toString('utf-8');
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
