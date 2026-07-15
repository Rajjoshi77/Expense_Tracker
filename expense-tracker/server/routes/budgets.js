/**
 * Budget Routes — CRUD for monthly budget limits
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to protect all endpoints
router.use(requireAuth);

// ── GET /api/budgets ──
router.get('/', async (req, res, next) => {
  try {
    const budgets = await prisma.budget.findMany({ 
      where: { userId: req.user.id },
      orderBy: { month: 'desc' } 
    });
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
      where: { 
        category_month_userId: { 
          category, 
          month: currentMonth, 
          userId: req.user.id 
        } 
      },
      update: { monthlyLimit: parseFloat(monthlyLimit) },
      create: { 
        category, 
        monthlyLimit: parseFloat(monthlyLimit), 
        month: currentMonth, 
        userId: req.user.id 
      },
    });
    res.status(201).json(budget);
  } catch (err) { next(err); }
});

// ── DELETE /api/budgets/:id ──
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.budget.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Budget not found or unauthorized' });
    }

    await prisma.budget.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Budget not found' });
    next(err);
  }
});

export default router;
