import prisma from '../lib/prisma.js';

/**
 * Generates run-rate monthly spend forecasts, checks budget overspend risk, and detects transaction anomalies.
 */
export async function getSpendForecast() {
  try {
    const expenses = await prisma.expense.findMany({
      select: { id: true, name: true, amount: true, category: true, date: true }
    });

    if (expenses.length === 0) {
      return {
        currentMonthTotal: 0,
        forecastedTotal: 0,
        runRateDaily: 0,
        categoryForecasts: [],
        anomalies: []
      };
    }

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentDay = now.getDate();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // 1. Current Month Metrics
    const currentMonthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const elapsedDays = Math.max(1, currentDay);
    const forecastedTotal = (currentMonthTotal / elapsedDays) * daysInMonth;

    // Group current month by category
    const currentMonthCatMap = {};
    currentMonthExpenses.forEach(e => {
      currentMonthCatMap[e.category] = (currentMonthCatMap[e.category] || 0) + e.amount;
    });

    // Get Active Budgets
    const budgets = await prisma.budget.findMany();
    const budgetMap = {};
    budgets.forEach(b => {
      budgetMap[b.category] = b.monthlyLimit;
    });

    // Calculate overspend risk per category
    const categoryForecasts = [];
    const categoriesToCheck = new Set([...Object.keys(currentMonthCatMap), ...Object.keys(budgetMap)]);

    for (const category of categoriesToCheck) {
      const spent = currentMonthCatMap[category] || 0;
      const catForecast = (spent / elapsedDays) * daysInMonth;
      const limit = budgetMap[category] || 0;
      const overshootRisk = limit > 0 && catForecast > limit;
      const overshootPercent = limit > 0 ? ((catForecast - limit) / limit) * 100 : 0;

      // Only include if there is spent amount or an active budget
      if (spent > 0 || limit > 0) {
        categoryForecasts.push({
          category,
          spent,
          forecast: Math.round(catForecast),
          budget: limit,
          overshootRisk,
          overshootPercent: Math.round(overshootPercent)
        });
      }
    }

    // 2. Anomaly Detection (Mean + 2 * StdDev)
    const catExpensesList = {};
    expenses.forEach(e => {
      if (!catExpensesList[e.category]) catExpensesList[e.category] = [];
      catExpensesList[e.category].push(e);
    });

    const anomalies = [];
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const [category, list] of Object.entries(catExpensesList)) {
      if (list.length < 5) continue; // Need enough history to compute standard deviation

      const amounts = list.map(e => e.amount);
      const sum = amounts.reduce((a, b) => a + b, 0);
      const mean = sum / amounts.length;
      
      const sqDiffs = amounts.map(a => Math.pow(a - mean, 2));
      const variance = sqDiffs.reduce((a, b) => a + b, 0) / amounts.length;
      const stdDev = Math.sqrt(variance);

      // Threshold is Mean + 2 * Standard Deviations
      const threshold = mean + 2 * stdDev;

      // Scan recent expenses for items that exceed this threshold
      list.forEach(e => {
        const eDate = new Date(e.date);
        // Only flag recent, significant items (> ₹300) to avoid noisy alerts
        if (eDate >= thirtyDaysAgo && e.amount > threshold && e.amount > 300) {
          anomalies.push({
            id: e.id,
            name: e.name,
            amount: e.amount,
            category: e.category,
            date: e.date.toISOString().split('T')[0],
            mean: Math.round(mean),
            threshold: Math.round(threshold),
            percentHigher: Math.round(((e.amount - mean) / mean) * 100)
          });
        }
      });
    }

    return {
      currentMonthTotal,
      forecastedTotal: Math.round(forecastedTotal),
      runRateDaily: Math.round(currentMonthTotal / elapsedDays),
      categoryForecasts,
      anomalies: anomalies.sort((a, b) => b.amount - a.amount).slice(0, 5)
    };
  } catch (error) {
    console.error('[Prediction Service] Error:', error.message);
    throw error;
  }
}

export default {
  getSpendForecast
};
