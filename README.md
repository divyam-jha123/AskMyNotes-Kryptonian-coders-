# AskMyNotes 🚀

**AskMyNotes** is a premium, AI-powered study companion designed to turn your static notes into interactive learning sessions. Upload PDFs or text files and engage in natural language conversations with your material using state-of-the-art Generative AI.

## ✨ Features

- **Intellectual RAG (Retrieval-Augmented Generation):** Upload PDFs or TXT files and ask complex questions based on the content.
- **Multi-Modal Interaction:** Full Speech-to-Speech (STT & TTS) support. Listen to your notes and chat with the AI using your voice.
- **Automated Study Aids:** Generate summarized notes, flashcards, and study questions automatically from your uploaded material.
- **Hybrid Authentication:** Secure access via Google SSO (Clerk) or traditional Email/Password login.
- **Cloud Persistence:** Your chat history, subjects, and vectors are stored securely in MongoDB and Cloudinary.
- **Premium UI/UX:** A modern, dark-themed dashboard with sleek animations and responsive design.

## 🏗️ Architecture

The project follows a modern full-stack decoupled architecture:

### Frontend (React + Vite)
- **API Layer:** Centralized API management in `src/api/` using Fetch with Clerk session token integration.
- **Global State:** React hooks for managing auth state and UI transitions.
- **Components:** Modular, reusable components with rich aesthetics and interactive micro-animations.

### Backend (Node.js + Express)
- **Routing:** Versioned API routes for Subjects, Notes (Uploads), Chat, and User management.
- **Authentication Middleware:** A hybrid middleware that validates both Clerk SSO tokens and custom JWT cookies.
- **Services Layer:**
  - `pdfParser.js`: Handles document parsing and logical chunking.
  - `vectorStore.js`: Manages embedding storage and retrieval using MongoDB.
  - `gemini.js`: Interfaces with Google Gemini 2.5 Flash for high-speed, intelligent responses.

### Data Flow (RAG Pipeline)
1. **Upload:** User uploads a document -> Backend receives via Multer MemoryStorage.
2. **Process:** Document is parsed -> Split into semantic chunks -> Uploaded to Cloudinary for reference.
3. **Embed:** Chunks are vectorized and stored in MongoDB.
4. **Chat:** User asks a question -> Most relevant chunks are retrieved -> Sent as context to Gemini -> Answer returned to User.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Clerk Auth, Lucide React, CSS3 (Custom Glassmorphism).
- **Backend:** Express, Mongoose, Multer, Cloudinary, @google/generative-ai.
- **Database:** MongoDB (Atlas).
- **Hosting:** Vercel (Production optimized).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- MongoDB Atlas account
- Cloudinary account
- Google Gemini API Key
- Clerk account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/divyam-jha123/AskMyNotes.git
   cd AskMyNotes
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with:
   # MONGODB_URI, JWT_SECRET, CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY, 
   # GEMINI_API_KEY, CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with:
   # VITE_CLERK_PUBLISHABLE_KEY
   npm run dev
   ```

## 📄 License
This project is licensed under the ISC License.

---
Built with ❤️ for the Hackathon.
