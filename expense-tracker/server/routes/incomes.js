import { Router } from 'express';
import prisma from '../lib/prisma.js';

const router = Router();

// ── GET /api/incomes — List all income entries ──
router.get('/', async (req, res, next) => {
  try {
    const incomes = await prisma.income.findMany({
      orderBy: { date: 'desc' }
    });
    res.json(incomes);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/incomes — Create income entry ──
router.post('/', async (req, res, next) => {
  try {
    const { source, amount, date, isRecurring, note } = req.body;

    if (!source || !amount) {
      return res.status(400).json({ error: 'source and amount are required' });
    }

    const income = await prisma.income.create({
      data: {
        source: source.trim(),
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        isRecurring: !!isRecurring,
        note: note?.trim() || null
      }
    });

    res.status(201).json(income);
  } catch (err) {
    next(err);
  }
});

// ── DELETE /api/incomes/:id — Delete income entry ──
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.income.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
