import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { aiApi } from '../services/api';
import { InsightCard } from './AiChatBubble';

const AiInsightsPanel = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    aiApi.getInsights()
      .then(data => {
        setInsights(data.insights || []);
        setError(false);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/15">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
          </div>
          <div>
            <h2 className="text-heading-sm text-ink">AI Insights</h2>
            <p className="text-caption mt-0.5">Powered by Gemini</p>
          </div>
        </div>

        <motion.button
          onClick={() => navigate('/ai')}
          className="btn-ghost btn-sm text-xs gap-1.5 text-primary"
          whileTap={{ scale: 0.95 }}
        >
          Ask AI
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="loading" className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-xl bg-surface-50 animate-pulse" />
            ))}
          </motion.div>
        ) : error ? (
          <motion.div key="error" className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-caption mb-2">Backend not running</p>
            <p className="text-[11px] text-ink-subtle">Start the server: <code className="text-primary">cd server && npm run dev</code></p>
          </motion.div>
        ) : insights.length > 0 ? (
          <motion.div key="insights" className="space-y-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {insights.slice(0, 4).map((insight, i) => (
              <InsightCard key={i} insight={insight} index={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="empty" className="text-center py-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-caption">Add expenses to unlock AI insights</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Ask */}
      <motion.button
        onClick={() => navigate('/ai')}
        className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-primary/30 bg-primary-50/30
                   text-sm text-primary font-medium hover:bg-primary-50 hover:border-primary/50 transition-all"
        whileTap={{ scale: 0.98 }}
      >
        💬 Ask AI about your finances →
      </motion.button>
    </motion.div>
  );
};

export default AiInsightsPanel;
