// Vercel serverless entry point — wraps the entire Express app
const express = require('express');
const cors    = require('cors');
const dotenv  = require('dotenv');

dotenv.config();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: true,   // allow all origins — safe for this project
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
