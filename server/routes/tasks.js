const express = require('express');
const router  = express.Router();
const prisma  = require('../config/prisma');
const { protect } = require('../middleware/auth');
const { serializeTags, withTags, withTagsMany } = require('../utils/tags');

router.use(protect);

// helper: attach parsed tags + category to a task
const format = (task) => {
  if (!task) return task;
  const t = withTags(task);
  return t;
};
const formatMany = (tasks) => tasks.map(format);

// ─── GET /api/tasks/analytics ────────────────────────────────────────────────
// Must be defined BEFORE /:id so it isn't caught as an id
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user.id;

    // All tasks for this user
    const tasks = await prisma.task.findMany({
      where: { userId },
      select: { status: true, priority: true, createdAt: true, dueDate: true, categoryId: true },
    });

    // Priority distribution
    const priorityDist = { low: 0, medium: 0, high: 0 };
    tasks.forEach((t) => { if (priorityDist[t.priority] !== undefined) priorityDist[t.priority]++; });

    // Status distribution
    const statusDist = { todo: 0, 'in-progress': 0, completed: 0 };
    tasks.forEach((t) => { if (statusDist[t.status] !== undefined) statusDist[t.status]++; });

    // Tasks created per day — last 14 days
    const now  = new Date();
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() - (13 - i));
      d.setHours(0, 0, 0, 0);
      return d;
    });

    const createdPerDay = days.map((day) => {
      const next = new Date(day); next.setDate(next.getDate() + 1);
      return {
        date:  day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: tasks.filter((t) => new Date(t.createdAt) >= day && new Date(t.createdAt) < next).length,
      };
    });

    const completedPerDay = days.map((day) => {
      const next = new Date(day); next.setDate(next.getDate() + 1);
      return {
        date:  day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: tasks.filter((t) => t.status === 'completed' && new Date(t.createdAt) >= day && new Date(t.createdAt) < next).length,
      };
    });

    // Overdue count
    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const overdue  = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < today && t.status !== 'completed').length;
    const dueToday = tasks.filter((t) => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime() && t.status !== 'completed';
    }).length;

    // Completion rate
    const total            = tasks.length;
    const completed        = statusDist.completed;
    const completionRate   = total > 0 ? Math.round((completed / total) * 100) : 0;

    res.json({ priorityDist, statusDist, createdPerDay, completedPerDay, overdue, dueToday, total, completed, completionRate });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── GET /api/tasks/stats ─────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [todo, inProgress, completed, total] = await Promise.all([
      prisma.task.count({ where: { userId: req.user.id, status: 'todo' } }),
      prisma.task.count({ where: { userId: req.user.id, status: 'in-progress' } }),
      prisma.task.count({ where: { userId: req.user.id, status: 'completed' } }),
      prisma.task.count({ where: { userId: req.user.id } }),
    ]);
    res.json({ todo, 'in-progress': inProgress, completed, total });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc', categoryId, dueToday } = req.query;
    const where = { userId: req.user.id };

    if (status     && status     !== 'all') where.status     = status;
    if (priority   && priority   !== 'all') where.priority   = priority;
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId;
    if (search) {
      where.OR = [
        { title:       { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (dueToday === 'true') {
      const start = new Date(); start.setHours(0, 0, 0, 0);
      const end   = new Date(); end.setHours(23, 59, 59, 999);
      where.dueDate = { gte: start, lte: end };
      where.status  = { not: 'completed' };
    }

    const allowedSort = ['createdAt', 'updatedAt', 'dueDate', 'title', 'priority'];
    const sortField   = allowedSort.includes(sortBy) ? sortBy : 'createdAt';
    const sortOrder   = order === 'asc' ? 'asc' : 'desc';

    const tasks = await prisma.task.findMany({
      where,
      orderBy:  { [sortField]: sortOrder },
      include:  { category: { select: { id: true, name: true, color: true, icon: true } } },
    });

    res.json(withTagsMany(tasks));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── GET /api/tasks/:id ───────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where:   { id: req.params.id, userId: req.user.id },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(withTags(task));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
router.post('/', async (req, res) => {
  try {
    const { title, description = '', status = 'todo', priority = 'medium', dueDate, tags = [], categoryId, timerSeconds } = req.body;
    if (!title?.trim()) return res.status(400).json({ message: 'Task title is required' });

    const task = await prisma.task.create({
      data: {
        title: title.trim(), description: description.trim(),
        status, priority,
        dueDate:      dueDate      ? new Date(dueDate) : null,
        tags:         serializeTags(tags),
        categoryId:   categoryId   || null,
        timerSeconds: timerSeconds || 0,
        userId:       req.user.id,
      },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
    res.status(201).json(withTags(task));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ─── PUT /api/tasks/:id ───────────────────────────────────────────────────────
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const { title, description, status, priority, dueDate, tags, categoryId, timerSeconds } = req.body;
    const data = {};
    if (title       !== undefined) data.title       = title.trim();
    if (description !== undefined) data.description = description.trim();
    if (status      !== undefined) data.status      = status;
    if (priority    !== undefined) data.priority    = priority;
    if (dueDate     !== undefined) data.dueDate     = dueDate ? new Date(dueDate) : null;
    if (tags        !== undefined) data.tags        = serializeTags(tags);
    if (categoryId  !== undefined) data.categoryId  = categoryId || null;
    if (timerSeconds !== undefined) data.timerSeconds = timerSeconds;

    const updated = await prisma.task.update({
      where:   { id: req.params.id },
      data,
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
    res.json(withTags(updated));
  } catch (e) { res.status(400).json({ message: e.message }); }
});

// ─── PATCH /api/tasks/:id/status ─────────────────────────────────────────────
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo','in-progress','completed'].includes(status))
      return res.status(400).json({ message: 'Invalid status value' });

    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });

    const updated = await prisma.task.update({
      where:   { id: req.params.id },
      data:    { status },
      include: { category: { select: { id: true, name: true, color: true, icon: true } } },
    });
    res.json(withTags(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.task.findFirst({ where: { id: req.params.id, userId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Task not found' });
    await prisma.task.delete({ where: { id: req.params.id } });
    res.json({ message: 'Task deleted successfully', id: req.params.id });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
