require('dotenv').config();
const express = require('express');

// --- EARLY DEBUG ENDPOINTS (before complex imports) ---
const app = express();

// Minimal ping to check if function loads
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Early health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    env: {
      mongodb: !!process.env.MONGODB_URI,
      jwt: !!process.env.JWT_SECRET
    },
    node: process.version
  });
});

// Global process handlers to catch production crashes
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught Exception:', err.stack || err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[CRITICAL] Unhandled Rejection at:', promise, 'reason:', reason);
});

const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDb = require('./db/connection');

// Routes
const userRoutes = require('./routes/user');
const subjectRoutes = require('./routes/subjects');
const notesRoutes = require('./routes/notes');
const chatRoutes = require('./routes/chat');
const studyRoutes = require('./routes/study');

console.log('[Backend] Starting with ENV check:');
console.log(' - MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'MISSING');
console.log(' - JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');

const port = process.env.PORT || 5001;

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow if no origin (same-site) or from a trusted domain
    if (!origin || origin.includes('vercel.app') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB Connection helper
let cachedDb = null;
const connectToDatabase = async () => {
  if (cachedDb) return cachedDb;
  cachedDb = await connectDb(process.env.MONGODB_URI);
  return cachedDb;
};


// Middleware to ensure DB is connected
app.use(async (req, res, next) => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const db = await connectToDatabase();
    if (!db && !cachedDb) {
      throw new Error('Database connection returned undefined');
    }
    next();
  } catch (err) {
    console.error('[DB Middleware Error]', err.message);
    res.status(500).json({
      error: 'Database connection failed',
      details: err.message,
      hint: 'Check if MONGODB_URI is correct and your IP is whitelisted in MongoDB Atlas.'
    });
  }
});

// Mount routes
app.use('/user', userRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/study', studyRoutes);

// Global error handler — prevent FUNCTION_INVOCATION_FAILED
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.stack || err.message || err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

// Export for Vercel
module.exports = app;

// Listen only if running directly
if (require.main === module) {
  const startServer = async () => {
    await connectToDatabase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  };
  startServer();
}