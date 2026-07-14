/**
 * AI Routes — RAG Chat, Semantic Search, Smart Insights
 */
import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { processQuestion, searchExpenses } from '../services/ragService.js';
import { generateSmartInsights } from '../services/insightsService.js';

const router = Router();

// ── POST /api/ai/chat — Natural language query via RAG ──
router.post('/chat', async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: { role: 'user', content: message.trim() },
    });

    // Process through RAG pipeline
    const result = await processQuestion(message.trim());

    // Save AI response
    await prisma.chatMessage.create({
      data: {
        role: 'assistant',
        content: result.answer,
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

    const results = await searchExpenses(query.trim());

    // Strip embeddings from response
    const cleaned = results.map(({ embedding, ...rest }) => rest);

    res.json({ results: cleaned, count: cleaned.length });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/ai/insights — Generate smart insights ──
router.get('/insights', async (_req, res, next) => {
  try {
    const insights = await generateSmartInsights();
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

// ── DELETE /api/ai/history — Clear chat history ──
router.delete('/history', async (_req, res, next) => {
  try {
    await prisma.chatMessage.deleteMany();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

export default router;
