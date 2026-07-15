/**
 * Subscription Routes — Track recurring subscriptions
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to protect all endpoints
router.use(requireAuth);

// ── GET /api/subscriptions ──
router.get('/', async (req, res, next) => {
  try {
    const subs = await prisma.subscription.findMany({ 
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' } 
    });
    res.json(subs);
  } catch (err) { next(err); }
});

// ── POST /api/subscriptions ──
router.post('/', async (req, res, next) => {
  try {
    const { name, amount, billingCycle, category, note } = req.body;
    if (!name || !amount) {
      return res.status(400).json({ error: 'name and amount are required' });
    }

    const sub = await prisma.subscription.create({
      data: {
        name: name.trim(),
        amount: parseFloat(amount),
        billingCycle: billingCycle || 'monthly',
        category: category || 'Other',
        note: note?.trim() || null,
        userId: req.user.id
      },
    });
    res.status(201).json(sub);
  } catch (err) { next(err); }
});

// ── PUT /api/subscriptions/:id — Toggle active/inactive ──
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, name, amount, billingCycle, category } = req.body;

    // Verify ownership
    const existing = await prisma.subscription.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found or unauthorized' });
    }

    const data = {};
    if (isActive !== undefined) data.isActive = isActive;
    if (name) data.name = name.trim();
    if (amount) data.amount = parseFloat(amount);
    if (billingCycle) data.billingCycle = billingCycle;
    if (category) data.category = category;

    const sub = await prisma.subscription.update({ where: { id }, data });
    res.json(sub);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Subscription not found' });
    next(err);
  }
});

// ── DELETE /api/subscriptions/:id ──
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.subscription.findFirst({ where: { id, userId: req.user.id } });
    if (!existing) {
      return res.status(404).json({ error: 'Subscription not found or unauthorized' });
    }

    await prisma.subscription.delete({ where: { id } });
    res.json({ success: true });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Subscription not found' });
    next(err);
  }
});

export default router;
