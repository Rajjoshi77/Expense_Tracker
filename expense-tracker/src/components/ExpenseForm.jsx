import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CATEGORIES } from '../data/categories';

const FieldError = ({ msg }) => (
  <AnimatePresence>
    {msg && (
      <motion.p
        className="flex items-center gap-1 mt-1 text-xs text-danger"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.15 }}
      >
        <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"/>
        </svg>
        {msg}
      </motion.p>
    )}
  </AnimatePresence>
);

const EMPTY = { name: '', amount: '', category: '' };

const ExpenseForm = ({ onAddExpense }) => {
  const [form, setForm]       = useState(EMPTY);
  const [errors, setErrors]   = useState({});
  const [status, setStatus]   = useState('idle');

  const handleChange = ({ target: { name, value } }) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name   = 'Expense name is required';
    else if (form.name.trim().length < 2)  e.name = 'At least 2 characters';
    if (!form.amount)                e.amount  = 'Amount is required';
    else if (+form.amount <= 0)      e.amount  = 'Enter a valid positive amount';
    if (!form.category)              e.category = 'Select a category';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setStatus('loading');
    await new Promise(r => setTimeout(r, 350));

    onAddExpense({
      id:       Date.now(),
      name:     form.name.trim(),
      amount:   parseFloat((+form.amount).toFixed(2)),
      category: form.category,
      date:     new Date().toISOString(),
    });

    setForm(EMPTY);
    setErrors({});
    setStatus('success');
    setTimeout(() => setStatus('idle'), 2000);
  };

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
    >
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
        </div>
        <div>
          <h2 className="text-heading-sm text-ink">Add Expense</h2>
          <p className="text-caption mt-0.5">Record a new spending entry</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label htmlFor="expense-name" className="label">Expense name</label>
          <input
            id="expense-name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Team lunch, Server costs…"
            className={`input ${errors.name ? 'input-error' : ''}`}
          />
          <FieldError msg={errors.name} />
        </div>

        <div>
          <label htmlFor="expense-amount" className="label">Amount</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-ink-muted font-medium select-none">$</span>
            <input
              id="expense-amount"
              name="amount"
              type="number"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={`input pl-7 ${errors.amount ? 'input-error' : ''}`}
            />
          </div>
          <FieldError msg={errors.amount} />
        </div>

        <div>
          <label htmlFor="expense-category" className="label">Category</label>
          <div className="relative">
            <select
              id="expense-category"
              name="category"
              value={form.category}
              onChange={handleChange}
              className={`input appearance-none cursor-pointer pr-9 ${errors.category ? 'input-error' : ''}`}
            >
              <option value="" disabled>Select a category…</option>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
            <svg
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>
          <FieldError msg={errors.category} />
        </div>

        <motion.button
          id="add-expense-btn"
          type="submit"
          disabled={status === 'loading'}
          className="btn-primary btn-lg w-full mt-1"
          whileTap={{ scale: 0.98 }}
        >
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.span key="ok" className="flex items-center gap-2"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                Expense added
              </motion.span>
            ) : status === 'loading' ? (
              <motion.span key="spin" className="flex items-center gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Adding…
              </motion.span>
            ) : (
              <motion.span key="idle" className="flex items-center gap-2"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Add Expense
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </form>
    </motion.div>
  );
};

export default ExpenseForm;
