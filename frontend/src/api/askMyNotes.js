const API_BASE = '/api';

/**
 * Get auth headers for API requests.
 * Uses JWT cookie (sent automatically with credentials: 'include').
 * Also supports Bearer token from localStorage for non-cookie scenarios.
 */
async function getAuthHeaders() {
    const headers = {};
    const user = localStorage.getItem('user');
    if (user) {
        try {
            const parsed = JSON.parse(user);
            if (parsed.token) {
                headers['Authorization'] = `Bearer ${parsed.token}`;
            }
        } catch (err) {
            // Ignore parse errors
        }
    }
    return headers;
}

async function parseJSON(res) {
    const text = await res.text();
    if (!text) throw new Error('Empty response from server.');
    try {
        return JSON.parse(text);
    } catch {
        throw new Error(`Unexpected response: ${text.slice(0, 120)}`);
    }
}

// --- Subjects ---

export async function createSubject(name) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ name }),
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to create subject');
    return data;
}

export async function getSubjects() {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/subjects`, {
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to load subjects');
    return data;
}

export async function getSubject(id) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to load subject');
    return data;
}

export async function deleteSubject(id) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/subjects/${id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to delete subject');
    return data;
}

// --- Notes ---

export async function uploadNote(subjectId, file) {
    const authHeaders = await getAuthHeaders();
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/notes/${subjectId}/upload`, {
        method: 'POST',
        credentials: 'include',
        headers: authHeaders,  // No Content-Type — browser sets it for FormData
        body: formData,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Upload failed');
    return data;
}

export async function getNotes(subjectId) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/notes/${subjectId}`, {
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to load notes');
    return data;
}

export async function deleteNote(subjectId, noteId) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/notes/${subjectId}/${noteId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to delete note');
    return data;
}

// --- Chat ---

export async function sendMessage(subjectId, question) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/${subjectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ question }),
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Chat failed');
    return data;
}

export async function getChatHistory(subjectId) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/${subjectId}/history`, {
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to load history');
    return data;
}

export async function clearChatHistory(subjectId) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/${subjectId}/history`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to clear history');
    return data;
}

export async function getAllChatHistories() {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/chat/history/all`, {
        credentials: 'include',
        headers: authHeaders,
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Failed to load chat histories');
    return data;
}

// --- Study ---

export async function generateStudy(subjectId, topic) {
    const authHeaders = await getAuthHeaders();
    const res = await fetch(`${API_BASE}/study/${subjectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        credentials: 'include',
        body: JSON.stringify({ topic }),
    });
    const data = await parseJSON(res);
    if (!res.ok) throw new Error(data.message || 'Study generation failed');
    return data;
}
