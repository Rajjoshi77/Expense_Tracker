/**
 * RAG Service — Retrieval-Augmented Generation Pipeline
 *
 * 1. User question → Generate embedding
 * 2. Vector search → Find top-K relevant expenses
 * 3. SQL query → Get structured data (totals, averages, budgets)
 * 4. Combine context → Send to LLM with system prompt
 * 5. Return formatted answer
 */
import prisma from '../lib/prisma.js';
import { semanticSearch, expenseToDocument } from './embeddingService.js';
import { generateChatResponse } from './llmService.js';

/**
 * Build structured context from expenses for the LLM
 */
function buildStructuredContext(expenses, stats, budgets, subscriptions, incomes = []) {
  const lines = [];

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalSpent = stats.totalSpent;
  const netSavings = totalIncome - totalSpent;

  // ── Summary stats ──
  lines.push('## 📊 Financial Summary');
  lines.push(`- Total income tracked: ₹${totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  lines.push(`- Total expenses tracked: ₹${totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  lines.push(`- Net Savings / Cash Flow: ₹${netSavings.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  lines.push(`- Total transactions: ${expenses.length} expenses, ${incomes.length} incomes`);
  lines.push(`- Average expense transaction: ₹${stats.avgTransaction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
  lines.push(`- Date range: ${stats.dateRange}`);
  lines.push('');

  // ── Income list ──
  if (incomes.length > 0) {
    lines.push('## 💵 Income Details');
    incomes.slice(0, 10).forEach(i => {
      const iDate = new Date(i.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      lines.push(`- ${i.source}: ₹${i.amount.toLocaleString('en-IN')} on ${iDate} ${i.isRecurring ? '(Recurring)' : ''}`);
    });
    lines.push('');
  }

  // ── Category breakdown ──
  if (stats.byCategory.length > 0) {
    lines.push('## 📂 Spending by Category');
    stats.byCategory.forEach(c => {
      lines.push(`- ${c.category}: ₹${c.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${c.count} transactions, ${c.pct}%)`);
    });
    lines.push('');
  }

  // ── Monthly breakdown ──
  if (stats.byMonth.length > 0) {
    lines.push('## 📅 Monthly Spending');
    stats.byMonth.forEach(m => {
      lines.push(`- ${m.month}: ₹${m.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${m.count} transactions)`);
    });
    lines.push('');
  }

  // ── Type breakdown ──
  if (stats.byType.length > 0) {
    lines.push('## 🏷️ Spending by Type');
    stats.byType.forEach(t => {
      lines.push(`- ${t.type}: ₹${t.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (${t.count} transactions)`);
    });
    lines.push('');
  }

  // ── Budgets ──
  if (budgets.length > 0) {
    lines.push('## 💰 Budgets');
    budgets.forEach(b => {
      const catSpend = stats.byCategory.find(c => c.category === b.category);
      const spent = catSpend ? catSpend.total : 0;
      const pct = b.monthlyLimit > 0 ? Math.round((spent / b.monthlyLimit) * 100) : 0;
      lines.push(`- ${b.category}: ₹${spent.toLocaleString('en-IN')} / ₹${b.monthlyLimit.toLocaleString('en-IN')} (${pct}% used)`);
    });
    lines.push('');
  }

  // ── Subscriptions ──
  if (subscriptions.length > 0) {
    lines.push('## 🔄 Active Subscriptions');
    const totalSub = subscriptions.reduce((s, sub) => s + sub.amount, 0);
    subscriptions.forEach(sub => {
      lines.push(`- ${sub.name}: ₹${sub.amount.toLocaleString('en-IN')}/${sub.billingCycle}`);
    });
    lines.push(`- **Total subscriptions: ₹${totalSub.toLocaleString('en-IN')}/month**`);
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Calculate aggregate statistics from expenses
 */
function calculateStats(expenses) {
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const avgTransaction = expenses.length > 0 ? totalSpent / expenses.length : 0;

  // Date range
  const dates = expenses.map(e => new Date(e.date)).sort((a, b) => a - b);
  const dateRange = dates.length > 0
    ? `${dates[0].toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} — ${dates[dates.length - 1].toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}`
    : 'No data';

  // By category
  const catMap = {};
  expenses.forEach(e => {
    if (!catMap[e.category]) catMap[e.category] = { total: 0, count: 0 };
    catMap[e.category].total += e.amount;
    catMap[e.category].count += 1;
  });
  const byCategory = Object.entries(catMap)
    .map(([category, data]) => ({
      category,
      ...data,
      pct: totalSpent > 0 ? Math.round((data.total / totalSpent) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // By month
  const monthMap = {};
  expenses.forEach(e => {
    const month = new Date(e.date).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
    if (!monthMap[month]) monthMap[month] = { total: 0, count: 0 };
    monthMap[month].total += e.amount;
    monthMap[month].count += 1;
  });
  const byMonth = Object.entries(monthMap)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => b.total - a.total);

  // By type
  const typeMap = {};
  expenses.forEach(e => {
    const type = e.type || 'Regular';
    if (!typeMap[type]) typeMap[type] = { total: 0, count: 0 };
    typeMap[type].total += e.amount;
    typeMap[type].count += 1;
  });
  const byType = Object.entries(typeMap)
    .map(([type, data]) => ({ type, ...data }));

  return { totalSpent, avgTransaction, dateRange, byCategory, byMonth, byType };
}

/**
 * Main RAG pipeline — process a user question
 */
export async function processQuestion(userMessage) {
  // 1. Fetch all expenses from DB
  const allExpenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

  // 2. Semantic search — find most relevant expenses
  let relevantExpenses = allExpenses;
  if (allExpenses.some(e => e.embedding)) {
    relevantExpenses = await semanticSearch(userMessage, allExpenses, 15);
  }

  // 3. Calculate structured stats from ALL expenses
  const stats = calculateStats(allExpenses);

  // 4. Fetch budgets, subscriptions, and incomes
  const budgets = await prisma.budget.findMany();
  const subscriptions = await prisma.subscription.findMany({ where: { isActive: true } });
  const incomes = await prisma.income.findMany({ orderBy: { date: 'desc' } });

  // 5. Build context
  const structuredContext = buildStructuredContext(allExpenses, stats, budgets, subscriptions, incomes);

  // 6. Add semantically relevant expenses as detailed context
  let relevantContext = '';
  if (relevantExpenses.length > 0) {
    relevantContext = '\n## 🔍 Most Relevant Expenses for this Query\n';
    relevantExpenses.slice(0, 10).forEach(e => {
      relevantContext += `- ${expenseToDocument(e)}\n`;
    });
  }

  const fullContext = structuredContext + relevantContext;

  // 7. Generate response
  const response = await generateChatResponse(userMessage, fullContext);

  return {
    answer: response,
    relevantExpenses: relevantExpenses.slice(0, 5).map(e => ({
      id: e.id,
      name: e.name,
      amount: e.amount,
      category: e.category,
      date: e.date,
      merchant: e.merchant,
    })),
    stats: {
      totalExpenses: allExpenses.length,
      totalSpent: stats.totalSpent,
    },
  };
}

/**
 * Semantic search endpoint
 */
export async function searchExpenses(query) {
  const allExpenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } });

  if (allExpenses.some(e => e.embedding)) {
    return semanticSearch(query, allExpenses, 20);
  }

  // Fallback: simple text search
  const lower = query.toLowerCase();
  return allExpenses.filter(e =>
    e.name.toLowerCase().includes(lower) ||
    e.category.toLowerCase().includes(lower) ||
    (e.note && e.note.toLowerCase().includes(lower)) ||
    (e.merchant && e.merchant.toLowerCase().includes(lower))
  );
}

export default { processQuestion, searchExpenses };
