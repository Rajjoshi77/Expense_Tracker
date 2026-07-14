/**
 * Budget Routes — CRUD for monthly budget limits
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ── GET /api/budgets ──
router.get('/', async (_req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({ orderBy: { month: 'desc' } });
    res.json(budgets);
  } catch (err) { next(err); }
});

// ── POST /api/budgets ──
router.post('/', async (req, res, next) => {
  try {
    const { category, monthlyLimit, month } = req.body;
    if (!category || !monthlyLimit) {
      return res.status(400).json({ error: 'category and monthlyLimit are required' });
    }
    const currentMonth = month || new Date().toISOString().slice(0, 7);

    const budget = await prisma.budget.upsert({
      where: { category_month: { category, month: currentMonth } },
      update: { monthlyLimit: parseFloat(monthlyLimit) },
      create: { category, monthlyLimit: parseFloat(monthlyLimit), month: currentMonth },
    });
    res.status(201).json(budget);
  } catch (err) { next(err); }
});

// ── DELETE /api/budgets/:id ──
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.budget.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Budget not found' });
    next(err);
  }
});

export default router;
