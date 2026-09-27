// Vercel serverless entry point — wraps the entire Express app
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,           // set in Vercel env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────
app.use('/api/auth',       require('../routes/auth'));
app.use('/api/tasks',      require('../routes/tasks'));
app.use('/api/categories', require('../routes/categories'));

// Health check
app.get('/api', (req, res) => {
  res.json({ message: 'TaskFlow API is running', env: process.env.NODE_ENV });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'Server error' });
});

module.exports = app;
