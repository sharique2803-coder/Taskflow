const express = require('express');
const router  = express.Router();
const prisma  = require('../config/prisma');
const { protect } = require('../middleware/auth');

router.use(protect);

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      include: { _count: { select: { tasks: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(categories);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/categories
router.post('/', async (req, res) => {
  try {
    const { name, color = '#6366f1', icon = 'folder' } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Category name is required' });
    const cat = await prisma.category.create({
      data: { name: name.trim(), color, icon, userId: req.user.id },
    });
    res.status(201).json(cat);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    const { name, color, icon } = req.body;
    const data = {};
    if (name  !== undefined) data.name  = name.trim();
    if (color !== undefined) data.color = color;
    if (icon  !== undefined) data.icon  = icon;
    const updated = await prisma.category.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.category.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Category not found' });
    await prisma.category.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted', id: req.params.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
