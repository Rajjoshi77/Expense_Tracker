import { motion } from 'framer-motion';
import { CATEGORIES, CURRENCIES } from '../data/categories';
import heroImg from '../assets/hero.png';

const MiniSparkline = ({ color = '#4F46E5' }) => (
  <svg viewBox="0 0 80 28" className="w-20 h-7" fill="none">
    <polyline
      points="0,22 12,18 24,20 36,10 48,14 60,6 72,10 80,4"
      stroke={color}
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <polyline
      points="0,22 12,18 24,20 36,10 48,14 60,6 72,10 80,4 80,28 0,28"
      fill={color}
      fillOpacity="0.08"
    />
  </svg>
);

const Trend = ({ positive = true, value }) => (
  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-pill
    ${positive ? 'bg-success-50 text-success-600' : 'bg-danger-50 text-danger'}`}
  >
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d={positive ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}/>
    </svg>
    {value}
  </span>
);

const SummaryPanel = ({ expenses, convertedAmount, selectedCurrency, isConverting }) => {
  const totalAmountUSD = expenses.reduce((s, e) => s + e.amount, 0);
  const expenseCount = expenses.length;
  const currencyConfig = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];

  const catTotalsUSD = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
  })).sort((a, b) => b.total - a.total);
  const topCat = catTotalsUSD[0];

  const avgAmountUSD = expenseCount > 0 ? totalAmountUSD / expenseCount : 0;

  const BASE_BUDGET_USD = 2500;
  const exchangeRate = (convertedAmount && totalAmountUSD > 0) ? (convertedAmount / totalAmountUSD) : 1;
  const currentBudget = BASE_BUDGET_USD * exchangeRate;
  const currentTotal = selectedCurrency === 'USD' ? totalAmountUSD : (convertedAmount || 0);

  const budgetUsedPercent = Math.min(Math.round((totalAmountUSD / BASE_BUDGET_USD) * 100), 100);
  const remainingBudget = Math.max(currentBudget - currentTotal, 0);

  const stats = [
    {
      label:   'Total Spent (USD)',
      value:   `$${totalAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub:     `${expenseCount} transaction${expenseCount !== 1 ? 's' : ''}`,
      trend:   { positive: false, label: '+12.4%' },
      sparkColor: '#4F46E5',
      id: 'stat-total',
    },
    {
      label:   `In ${selectedCurrency}`,
      value:   isConverting
        ? '—'
        : convertedAmount !== null
          ? `${currencyConfig.symbol}${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
          : '—',
      sub:     'Live rate · Frankfurter API',
      trend:   null,
      sparkColor: '#7C3AED',
      id: 'stat-converted',
    },
    {
      label:   'Avg. Transaction',
      value:   `$${avgAmountUSD.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub:     'Per expense average',
      trend:   { positive: true, label: '-3.2%' },
      sparkColor: '#10B981',
      id: 'stat-avg',
    },
    {
      label:   'Top Category',
      value:   topCat?.total > 0 ? topCat.label : '—',
      sub:     topCat?.total > 0 ? `$${topCat.total.toFixed(2)} · ${topCat.count ?? 0} items` : 'No data',
      trend:   null,
      sparkColor: '#F59E0B',
      id: 'stat-top-cat',
    },
  ];

  return (
    <section>
      <motion.div
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <p className="text-overline mb-1.5">Financial Overview</p>
          <h1 className="text-display-md text-ink">
            Spending{' '}
            <span className="text-gradient-primary">Dashboard</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="badge badge-gray">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </motion.div>

      <motion.div
        className="card p-6 md:p-8 mb-4 relative overflow-hidden bg-white"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
      >
        <img 
          src={heroImg} 
          alt="" 
          className="absolute -right-10 -top-10 w-80 h-auto opacity-10 blur-sm pointer-events-none grayscale select-none"
        />
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-gradient-subtle opacity-60 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-caption mb-1 uppercase tracking-widest font-semibold text-ink-muted">
              Current Balance ({selectedCurrency})
            </p>
            <motion.div
              key={currentTotal}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-baseline gap-3"
            >
              <span className="font-display text-5xl md:text-6xl font-bold text-ink tracking-tight">
                {currencyConfig.symbol}{currentTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </motion.div>
            <p className="text-body mt-2">
              {expenseCount > 0
                ? `Total spending across ${expenseCount} transaction${expenseCount !== 1 ? 's' : ''}`
                : 'No expenses tracked yet — add your first one below'}
            </p>
          </div>

          <div className="md:min-w-[240px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-ink-secondary">Monthly Budget</span>
              <span className="text-xs font-semibold text-ink">{budgetUsedPercent}%</span>
            </div>
            <div className="progress-track mb-1">
              <motion.div
                className="progress-fill bg-gradient-primary"
                initial={{ width: 0 }}
                animate={{ width: `${budgetUsedPercent}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
            <p className="text-caption">
              {currencyConfig.symbol}{currentBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} budget · {currencyConfig.symbol}{remainingBudget.toLocaleString(undefined, { maximumFractionDigits: 0 })} left
            </p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {catTotalsUSD.filter(c => c.total > 0).slice(0, 3).map(cat => (
                <span key={cat.value} className="badge badge-gray text-[11px]">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: cat.color }} />
                  {cat.value}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.id}
            id={stat.id}
            className="card p-4 flex flex-col justify-between gap-3 group"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.08 * (i + 1) }}
            whileHover={{ y: -2, transition: { duration: 0.15 } }}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-caption font-medium text-ink-muted">{stat.label}</p>
              {stat.trend && <Trend positive={stat.trend.positive} value={stat.trend.label} />}
            </div>

            <motion.p
              key={stat.value}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-display text-xl font-bold text-ink tracking-tight truncate"
            >
              {isConverting && stat.id === 'stat-converted' ? (
                <span className="skeleton w-24 h-6 inline-block">&nbsp;</span>
              ) : stat.value}
            </motion.p>

            <div className="flex items-end justify-between gap-2">
              <p className="text-[11px] text-ink-subtle leading-tight">{stat.sub}</p>
              <MiniSparkline color={stat.sparkColor} />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default SummaryPanel;
