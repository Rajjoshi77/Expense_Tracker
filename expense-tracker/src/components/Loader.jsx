import { motion } from 'framer-motion';

const Loader = ({ message = 'Loading…', size = 'md' }) => {
  const ring = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';

  return (
    <div className="flex items-center gap-2.5">
      <motion.div
        className={`${ring} border-2 border-border border-t-primary rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }}
      />
      {message && (
        <span className="text-xs text-ink-muted font-medium">{message}</span>
      )}
    </div>
  );
};

export default Loader;
