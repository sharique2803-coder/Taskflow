const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const bcrypt  = require('bcryptjs');
const prisma  = require('../config/prisma');
const { protect } = require('../middleware/auth');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });

// ── POST /api/auth/register ──────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please fill in all fields' });
    if (password.length < 6)
      return res.status(400).json({ message: 'Password must be at least 6 characters' });

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, await bcrypt.genSalt(10));
    const user   = await prisma.user.create({
      data: { name: name.trim(), email: email.toLowerCase().trim(), password: hashed },
    });

    res.status(201).json({ _id: user.id, name: user.name, email: user.email, avatarEmoji: user.avatarEmoji, token: generateToken(user.id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── POST /api/auth/login ─────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Please provide email and password' });

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: 'Invalid email or password' });

    res.json({ _id: user.id, name: user.name, email: user.email, avatarEmoji: user.avatarEmoji, token: generateToken(user.id) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── GET /api/auth/me ─────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
  res.json({ _id: req.user.id, name: req.user.name, email: req.user.email });
});

// ── PUT /api/auth/me — update name / email / password / avatarEmoji
router.put('/me', protect, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword, avatarEmoji } = req.body;
    const data = {};

    if (name?.trim())  data.name  = name.trim();
    if (avatarEmoji)   data.avatarEmoji = avatarEmoji;

    if (email?.trim()) {
      const emailLower = email.toLowerCase().trim();
      if (emailLower !== req.user.email) {
        const conflict = await prisma.user.findUnique({ where: { email: emailLower } });
        if (conflict) return res.status(400).json({ message: 'Email already in use' });
        data.email = emailLower;
      }
    }

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ message: 'Current password is required to set a new one' });
      const full = await prisma.user.findUnique({ where: { id: req.user.id } });
      const ok   = await bcrypt.compare(currentPassword, full.password);
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
      if (newPassword.length < 6)
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      data.password = await bcrypt.hash(newPassword, await bcrypt.genSalt(10));
    }

    if (Object.keys(data).length === 0)
      return res.status(400).json({ message: 'No changes provided' });

    const updated = await prisma.user.update({ where: { id: req.user.id }, data });
    res.json({ _id: updated.id, name: updated.name, email: updated.email, avatarEmoji: updated.avatarEmoji });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── DELETE /api/auth/me — delete account + all data ─────────────
router.delete('/me', protect, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted successfully' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
