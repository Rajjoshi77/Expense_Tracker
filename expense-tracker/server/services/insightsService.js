/**
 * Insights Service — Automated smart financial insights
 */
import prisma from '../lib/prisma.js';
import { generateInsights as llmInsights } from './llmService.js';

/**
 * Generate rule-based + AI insights from spending data
 */
export async function generateSmartInsights() {
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

  if (expenses.length === 0) {
    return [{
      type: 'info',
      title: 'Get Started',
      description: 'Add your first expense to start getting AI-powered insights!',
      metric: '0',
    }];
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const insights = [];

  // ── Rule-based insights ──

  // 1. Top spending category
  const catMap = {};
  expenses.forEach(e => {
    catMap[e.category] = (catMap[e.category] || 0) + e.amount;
  });
  const topCat = Object.entries(catMap).sort(([, a], [, b]) => b - a)[0];
  if (topCat) {
    const pct = Math.round((topCat[1] / total) * 100);
    insights.push({
      type: pct > 40 ? 'warning' : 'info',
      title: `${topCat[0]} is your top category`,
      description: `You've spent ${pct}% of your total on ${topCat[0]}. ${pct > 40 ? 'Consider setting a budget limit.' : 'This looks balanced.'}`,
      metric: `₹${topCat[1].toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    });
  }

  // 2. Recurring vs one-time
  const recurring = expenses.filter(e => e.type === 'Recurring');
  const recurringTotal = recurring.reduce((s, e) => s + e.amount, 0);
  if (recurringTotal > 0) {
    const recurPct = Math.round((recurringTotal / total) * 100);
    insights.push({
      type: recurPct > 50 ? 'warning' : 'tip',
      title: 'Recurring expenses',
      description: `${recurPct}% of your spending is recurring. ${recurPct > 50 ? 'Review if all subscriptions are needed.' : 'Your recurring costs are well-managed.'}`,
      metric: `₹${recurringTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
    });
  }

  // 3. Average transaction size
  const avg = total / expenses.length;
  insights.push({
    type: 'info',
    title: 'Average transaction',
    description: `Your average expense is ₹${avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}. ${avg > 1000 ? 'Consider tracking smaller daily expenses too.' : 'Good level of tracking detail!'}`,
    metric: `₹${avg.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
  });

  // 4. Try AI-powered insights if enough data
  if (expenses.length >= 5) {
    try {
      const expenseData = expenses.slice(0, 30).map(e => (
        `${e.name}: ₹${e.amount} (${e.category}, ${e.type}, ${new Date(e.date).toLocaleDateString('en-IN')})`
      )).join('\n');

      const aiInsights = await llmInsights(expenseData);
      if (Array.isArray(aiInsights) && aiInsights.length > 0) {
        insights.push(...aiInsights.slice(0, 3));
      }
    } catch {
      // AI insights are optional — continue with rule-based ones
    }
  }

  return insights.slice(0, 6);
}

export default { generateSmartInsights };
