/**
 * AI Routes — RAG Chat, Semantic Search, Smart Insights
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { processQuestion, searchExpenses } from '../services/ragService.js';
import { generateSmartInsights } from '../services/insightsService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Apply auth middleware to protect all AI endpoints
router.use(requireAuth);

// ── POST /api/ai/chat — Natural language query via RAG ──
router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Save user message scoped to userId
    await prisma.chatMessage.create({
      data: { 
        role: 'user', 
        content: message.trim(),
        userId: req.user.id
      },
    });

    // Process through RAG pipeline scoped to userId
    const result = await processQuestion(message.trim(), req.user.id);

    // Save AI response scoped to userId
    await prisma.chatMessage.create({
      data: {
        role: 'assistant',
        content: result.answer,
        userId: req.user.id,
        metadata: JSON.stringify({
          relevantExpenses: result.relevantExpenses,
          stats: result.stats,
        }),
      },
    });

    res.json({
      answer: result.answer,
      relevantExpenses: result.relevantExpenses,
      stats: result.stats,
    });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/ai/search — Semantic search over expenses ──
router.post('/search', async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'query is required' });
    }

    const results = await searchExpenses(query.trim(), req.user.id);

    // Strip embeddings from response
    const cleaned = results.map(item => {
      const copy = { ...item };
      delete copy.embedding;
      return copy;
    });

    res.json({ results: cleaned, count: cleaned.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/insights — Generate smart insights ──
router.get('/insights', async (req, res, next) => {
  try {
    const insights = await generateSmartInsights(req.user.id);
    res.json({ insights });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/history — Get chat history ──
router.get('/history', async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const messages = await prisma.chatMessage.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' },
      take: parseInt(limit),
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    });

    res.json(messages);
  } catch (err) {
    next(err);
  }
});

export default router;
