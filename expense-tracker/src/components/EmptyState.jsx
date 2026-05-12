import { motion } from 'framer-motion';

const EmptyState = ({ onAddClick }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-14 px-6 text-center"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="w-14 h-14 rounded-2xl bg-primary-50 border border-primary-100 flex items-center justify-center mb-5">
        <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M9 14l-4-4m0 0l4-4m-4 4h11a4 4 0 010 8H7"/>
        </svg>
      </div>

      <h3 className="font-display font-semibold text-base text-ink mb-1.5">
        No expenses yet
      </h3>
      <p className="text-body max-w-xs mb-6">
        Add your first expense to start tracking your spending and get insights into your finances.
      </p>

      {onAddClick && (
        <button
          onClick={onAddClick}
          className="btn-primary btn-md"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Add First Expense
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
