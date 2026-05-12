import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpenseCard from './ExpenseCard';
import EmptyState from './EmptyState';
import { CATEGORIES } from '../data/categories';

const SORTS = [
  { value: 'newest',  label: 'Newest' },
  { value: 'oldest',  label: 'Oldest' },
  { value: 'highest', label: 'Highest' },
  { value: 'lowest',  label: 'Lowest' },
];

const ExpenseList = ({ expenses, onDelete }) => {
  const [filter,  setFilter]  = useState('All');
  const [sortBy,  setSortBy]  = useState('newest');
  const [search,  setSearch]  = useState('');

  const FILTERS = ['All', ...CATEGORIES.map(c => c.value)];

  let items = filter === 'All' ? expenses : expenses.filter(e => e.category === filter);

  if (search.trim()) {
    items = items.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  }

  items = [...items].sort((a, b) => {
    if (sortBy === 'newest')  return new Date(b.date) - new Date(a.date);
    if (sortBy === 'oldest')  return new Date(a.date) - new Date(b.date);
    if (sortBy === 'highest') return b.amount - a.amount;
    if (sortBy === 'lowest')  return a.amount - b.amount;
    return 0;
  });

  const totalFiltered = items.reduce((s, e) => s + e.amount, 0);

  return (
    <motion.div
      className="card p-5 h-full flex flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-border">
        <div>
          <h2 className="text-heading-sm text-ink">Transactions</h2>
          <p className="text-caption mt-0.5">
            {items.length} of {expenses.length} shown
            {items.length > 0 &&
              ` · $${totalFiltered.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} total`
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-ink-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"/>
          </svg>
          <select
            id="sort-expenses"
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-xs text-ink-secondary bg-surface-50 border border-border rounded-md
                       px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <div className="relative mb-3">
        <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transactions…"
          className="input pl-9 h-8 text-xs"
        />
      </div>

      <div className="flex items-center gap-1.5 flex-wrap mb-4">
        {FILTERS.map(f => (
          <motion.button
            key={f}
            id={`filter-${f.toLowerCase()}`}
            onClick={() => setFilter(f)}
            className={`btn text-xs px-3 py-1 h-6 rounded-pill transition-all duration-150
              ${filter === f
                ? 'bg-primary text-white shadow-primary'
                : 'bg-surface-50 border border-border text-ink-muted hover:text-ink hover:bg-surface-100'}`}
            whileTap={{ scale: 0.97 }}
          >
            {f}
          </motion.button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1 space-y-2 min-h-0 max-h-[520px]">
        {items.length === 0 ? (
          <EmptyState />
        ) : (
          <AnimatePresence mode="popLayout">
            {items.map((exp, i) => (
              <ExpenseCard
                key={exp.id}
                expense={exp}
                onDelete={onDelete}
                index={i}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {expenses.length > 0 && (
        <p className="text-caption mt-3 pt-3 border-t border-border">
          Hover over a row to reveal the delete button
        </p>
      )}
    </motion.div>
  );
};

export default ExpenseList;
