/**
 * Expense Routes — CRUD API with embedding generation
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { embedExpense } from '../services/embeddingService.js';

const router = Router();

// ── GET /api/expenses — List all with optional filters ──
router.get('/', async (req, res, next) => {
  try {
    const { category, type, search, startDate, endDate, sort = 'desc', limit } = req.query;

    const where = {};
    if (category) where.category = category;
    if (type) where.type = type;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { merchant: { contains: search } },
        { note: { contains: search } },
      ];
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { date: sort === 'asc' ? 'asc' : 'desc' },
      ...(limit && { take: parseInt(limit) }),
      select: {
        id: true,
        name: true,
        amount: true,
        category: true,
        type: true,
        date: true,
        merchant: true,
        note: true,
        user: true,
        createdAt: true,
      },
    });

    res.json(expenses);
  } catch (err) {
    next(err);
  }
});

// ── GET /api/expenses/stats — Aggregate stats for dashboard ──
router.get('/stats', async (req, res, next) => {
  try {
    const expenses = await prisma.expense.findMany({
      select: { amount: true, category: true, type: true, date: true },
    });

    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const count = expenses.length;
    const avg = count > 0 ? total / count : 0;

    // By category
    const catMap = {};
    expenses.forEach(e => {
      if (!catMap[e.category]) catMap[e.category] = { total: 0, count: 0 };
      catMap[e.category].total += e.amount;
      catMap[e.category].count += 1;
    });

    // By type
    const typeMap = {};
    expenses.forEach(e => {
      const t = e.type || 'Regular';
      if (!typeMap[t]) typeMap[t] = { total: 0, count: 0 };
      typeMap[t].total += e.amount;
      typeMap[t].count += 1;
    });

    res.json({
      total,
      count,
      average: avg,
      byCategory: Object.entries(catMap).map(([category, d]) => ({ category, ...d })).sort((a, b) => b.total - a.total),
      byType: Object.entries(typeMap).map(([type, d]) => ({ type, ...d })),
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/expenses — Create expense + generate embedding ──
router.post('/', async (req, res, next) => {
  try {
    const { name, amount, category, type, date, merchant, note, user } = req.body;

    if (!name || !amount || !category) {
      return res.status(400).json({ error: 'name, amount, and category are required' });
    }

    const expense = await prisma.expense.create({
      data: {
        name: name.trim(),
        amount: parseFloat(amount),
        category,
        type: type || 'Regular',
        date: date ? new Date(date) : new Date(),
        merchant: merchant?.trim() || null,
        note: note?.trim() || null,
        user: user || 'Me',
      },
    });

    // Generate embedding asynchronously (don't block response)
    embedExpense(expense)
      .then(embedding => {
        if (embedding) {
          prisma.expense.update({
            where: { id: expense.id },
            data: { embedding: JSON.stringify(embedding) },
          }).catch(console.error);
        }
      })
      .catch(console.error);

    res.status(201).json(expense);
  } catch (err) {
    next(err);
  }
});

// ── PUT /api/expenses/:id — Update expense ──
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, amount, category, type, date, merchant, note } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (category !== undefined) data.category = category;
    if (type !== undefined) data.type = type;
    if (date !== undefined) data.date = new Date(date);
    if (merchant !== undefined) data.merchant = merchant?.trim() || null;
    if (note !== undefined) data.note = note?.trim() || null;

    const expense = await prisma.expense.update({ where: { id }, data });

    // Re-generate embedding
    embedExpense(expense)
      .then(embedding => {
        if (embedding) {
          prisma.expense.update({
            where: { id: expense.id },
            data: { embedding: JSON.stringify(embedding) },
          }).catch(console.error);
        }
      })
      .catch(console.error);

    res.json(expense);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Expense not found' });
    next(err);
  }
});

// ── DELETE /api/expenses/:id ──
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Expense not found' });
    next(err);
  }
});

export default router;
