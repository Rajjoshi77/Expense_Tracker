import { motion } from 'framer-motion';
import { getCategoryConfig } from '../data/categories';

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const EMOJI = {
  Food:      '🍽️',
  Travel:    '✈️',
  Marketing: '📢',
  Utilities: '⚡',
  Other:     '📦',
};

const ExpenseCard = ({ expense, onDelete, index, isIncome = false }) => {
  const { amount, date, user = 'Me' } = expense;
  
  const title = isIncome ? expense.source : expense.name;
  const emoji = isIncome ? '💵' : (EMOJI[expense.category] ?? '💳');
  const catColor = isIncome ? '#10B981' : (getCategoryConfig(expense.category).color);
  const catLabel = isIncome ? 'Income' : (getCategoryConfig(expense.category).label);
  const typeLabel = isIncome ? (expense.isRecurring ? 'Recurring' : 'One-time') : expense.type;

  return (
    <motion.div
      className="group flex items-center gap-4 p-4 rounded-xl border border-border bg-surface
                 hover:border-border-strong hover:shadow-sm transition-all duration-150"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
      transition={{ duration: 0.25, delay: index * 0.03 }}
      layout
    >
      <div
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-base"
        style={{ background: `${catColor}14`, border: `1px solid ${catColor}28` }}
      >
        {emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-ink truncate">{title}</p>
          {user !== 'Me' && !isIncome && (
            <span className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
              {user}
            </span>
          )}
        </div>
        <p className="text-caption mt-0.5">{formatDate(date)}</p>
      </div>

      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <span
          className="badge text-[11px] font-medium"
          style={{
            background: `${catColor}12`,
            color: catColor,
            borderColor: `${catColor}28`,
          }}
        >
          {catLabel}
        </span>
        {typeLabel && (
          <span className="badge text-[11px] font-medium bg-slate-100 text-slate-600 border-slate-200">
            {typeLabel}
          </span>
        )}
      </div>

      <div className="text-right flex-shrink-0">
        <p className={`text-sm font-bold font-display ${isIncome ? 'text-success-600 font-extrabold' : 'text-ink'}`}>
          {isIncome ? '+' : ''}₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </p>
      </div>

      <motion.button
        id={`delete-${expense.id}`}
        onClick={() => onDelete(expense.id)}
        className="flex-shrink-0 w-7 h-7 rounded-lg border border-transparent
                   text-ink-subtle hover:text-danger hover:bg-danger-50 hover:border-danger/20
                   transition-all duration-150 flex items-center justify-center
                   opacity-0 group-hover:opacity-100"
        whileTap={{ scale: 0.9 }}
        aria-label={`Delete: ${title}`}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default ExpenseCard;
