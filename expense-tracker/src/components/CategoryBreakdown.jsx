import { motion } from 'framer-motion';
import { CATEGORIES, CURRENCIES } from '../data/categories';

const EMOJI = {
  Food:      '🍽️',
  Travel:    '✈️',
  Marketing: '📢',
  Utilities: '⚡',
  Other:     '📦',
};

const CategoryBreakdown = ({ expenses, selectedCurrency = 'USD' }) => {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const currencyConfig = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  const stats = CATEGORIES.map(cat => {
    const catTotal = expenses
      .filter(e => e.category === cat.value)
      .reduce((s, e) => s + e.amount, 0);
    const count = expenses.filter(e => e.category === cat.value).length;
    const pct   = total > 0 ? (catTotal / total) * 100 : 0;
    return { ...cat, total: catTotal, count, pct };
  }).sort((a, b) => b.total - a.total);

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-secondary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"/>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"/>
          </svg>
        </div>
        <div>
          <h2 className="text-heading-sm text-ink">By Category</h2>
          <p className="text-caption mt-0.5">Spending distribution</p>
        </div>
      </div>

      <div className="space-y-4">
        {stats.map((cat, i) => (
          <motion.div
            key={cat.value}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: 0.05 * i }}
          >
            <div className="flex items-center gap-3 mb-1.5">
              <div
                className="w-7 h-7 rounded-lg text-sm flex items-center justify-center flex-shrink-0"
                style={{ background: `${cat.color}14` }}
              >
                {EMOJI[cat.value]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-ink truncate">{cat.label}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-xs font-bold text-ink font-display">
                  {currencyConfig.symbol}{cat.total.toFixed(2)}
                </p>
              </div>

              <div className="w-10 text-right flex-shrink-0">
                <span className="text-[11px] font-medium text-ink-muted">
                  {cat.pct.toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="progress-track">
              <motion.div
                className="progress-fill"
                style={{ background: cat.pct > 0 ? cat.color : '#E5E7EB' }}
                initial={{ width: 0 }}
                animate={{ width: `${cat.pct}%` }}
                transition={{ duration: 0.7, delay: 0.08 * i, ease: 'easeOut' }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {total > 0 && (
        <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
          <span className="text-caption font-medium">Total tracked</span>
          <span className="font-display text-sm font-bold text-ink">
            {currencyConfig.symbol}{total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      )}

      {total === 0 && (
        <p className="text-caption text-center py-4 mt-2">
          Add expenses to see category breakdown
        </p>
      )}
    </motion.div>
  );
};

export default CategoryBreakdown;
