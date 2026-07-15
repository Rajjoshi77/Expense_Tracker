import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { signToken } from '../lib/jwt.js';

const router = Router();

// Sandbox accounts presets
const SANDBOX_PROFILES = {
  'raj@example.com': {
    email: 'raj@example.com',
    name: 'Raj Joshi',
    avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  'sarah@example.com': {
    email: 'sarah@example.com',
    name: 'Sarah Jenkins',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  'alex@example.com': {
    email: 'alex@example.com',
    name: 'Alex Mercer',
    avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
  }
};

/**
 * Handle user check-in, registration, and backfill orphaned records.
 */
async function registerOrLoginUser(email, name, avatarUrl) {
  let user = await prisma.user.findUnique({ where: { email } });
  let isNewUser = false;

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        avatarUrl
      }
    });
    isNewUser = true;
  }

  // Backfill orphaned items with userId: null to this user on their first login
  if (isNewUser) {
    try {
      await Promise.all([
        prisma.expense.updateMany({ where: { userId: null }, data: { userId: user.id } }),
        prisma.income.updateMany({ where: { userId: null }, data: { userId: user.id } }),
        prisma.budget.updateMany({ where: { userId: null }, data: { userId: user.id } }),
        prisma.subscription.updateMany({ where: { userId: null }, data: { userId: user.id } }),
        prisma.chatMessage.updateMany({ where: { userId: null }, data: { userId: user.id } })
      ]);
      console.log(`[Auth] Linked pre-existing records to new user: ${email}`);
    } catch (err) {
      console.error('[Auth Error] Failed to backfill orphaned records:', err.message);
    }
  }

  const token = signToken({
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl
  });

  return { token, user };
}

/**
 * POST /api/auth/google
 * Verifies and authenticates Google token credential
 */
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'Google credential token is required' });
    }

    // Verify token with Google authentication API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) {
      return res.status(400).json({ error: 'Failed to verify Google OAuth token' });
    }

    const payload = await response.json();
    const { email, name, picture } = payload;

    if (!email) {
      return res.status(400).json({ error: 'Email not provided by Google' });
    }

    const result = await registerOrLoginUser(email, name, picture);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/sandbox
 * Authenticates Developer Sandbox profiles
 */
router.post('/sandbox', async (req, res, next) => {
  try {
    const { email } = req.body;
    const profile = SANDBOX_PROFILES[email];

    if (!profile) {
      return res.status(400).json({ error: 'Invalid Sandbox developer profile selected' });
    }

    const result = await registerOrLoginUser(profile.email, profile.name, profile.avatarUrl);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

export default router;
