import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predictionApi } from '../services/api';

const BudgetPredictionWidget = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        const response = await predictionApi.getForecast();
        if (response.success) {
          setData(response.data);
        } else {
          setError('Failed to fetch predictions.');
        }
      } catch (err) {
        console.error('Error fetching forecasts:', err);
        setError('Forecast system offline.');
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    return (
      <div className="card p-5 bg-surface border border-border flex flex-col gap-3 animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="h-8 bg-slate-200 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-5/6" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card p-5 bg-danger-50 border border-danger-100 text-danger-800 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-danger animate-pulse shrink-0" />
        <span className="text-xs font-semibold">{error || 'Could not load predictions.'}</span>
      </div>
    );
  }

  const { currentMonthTotal, forecastedTotal, runRateDaily, categoryForecasts, anomalies } = data;
  const overshootCategories = categoryForecasts.filter(c => c.overshootRisk);

  return (
    <div className="card p-5 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/50 shadow-sm relative overflow-hidden flex flex-col gap-4">
      {/* Background soft glow decoration */}
      <div className="absolute -right-16 -top-16 w-32 h-32 rounded-full bg-primary/5 blur-xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-black text-indigo-900 uppercase tracking-wider">AI Spend Forecast</h3>
          <p className="text-[10px] text-indigo-700/70">Calculated from current monthly run-rate</p>
        </div>
        <div className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
          {new Date().toLocaleString('default', { month: 'long' })}
        </div>
      </div>

      {/* Figures */}
      <div className="flex items-baseline gap-2">
        <span className="text-heading-md font-black text-indigo-950">₹{forecastedTotal.toLocaleString('en-IN')}</span>
        <span className="text-[10px] text-indigo-700 font-semibold">predicted end-of-month</span>
      </div>

      {/* Progress metrics */}
      <div className="flex items-center justify-between text-[11px] text-indigo-900/80 bg-white/40 border border-white/60 p-2.5 rounded-xl backdrop-blur-sm">
        <div className="flex flex-col">
          <span className="text-[9px] uppercase tracking-wider text-indigo-600/70 font-semibold">Spent So Far</span>
          <span className="font-bold text-indigo-950">₹{currentMonthTotal.toLocaleString('en-IN')}</span>
        </div>
        <div className="w-px h-6 bg-indigo-200/50" />
        <div className="flex flex-col text-right">
          <span className="text-[9px] uppercase tracking-wider text-indigo-600/70 font-semibold">Daily Run-Rate</span>
          <span className="font-bold text-indigo-950">₹{runRateDaily.toLocaleString('en-IN')}/day</span>
        </div>
      </div>

      {/* Active warnings / alerts */}
      <AnimatePresence>
        {overshootCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-col gap-2 p-3 bg-warning-50 border border-warning-100/55 rounded-xl"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-warning-800">
              <svg className="w-3.5 h-3.5 text-warning shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Budget Overshoot Warning
            </div>
            <div className="flex flex-col gap-1 text-[10px] text-warning-700 font-semibold">
              {overshootCategories.map(c => (
                <div key={c.category} className="flex justify-between items-center">
                  <span>• {c.category} Budget</span>
                  <span>
                    Forecast: ₹{c.forecast.toLocaleString('en-IN')} (Limit ₹{c.budget.toLocaleString('en-IN')})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Anomalies section */}
      {anomalies.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-[10px] font-bold text-indigo-900/60 uppercase tracking-wider">Unusual Activity Flagged</div>
          <div className="flex flex-col gap-1.5">
            {anomalies.map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-2 rounded-lg bg-white/50 border border-white/80 hover:bg-white transition-all hover:scale-[1.01]"
              >
                <div className="overflow-hidden pr-2">
                  <p className="text-[10px] font-bold text-indigo-950 truncate leading-tight">{item.name}</p>
                  <p className="text-[9px] text-indigo-700/60">{item.category} • {item.date}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] font-extrabold text-indigo-950">₹{item.amount.toLocaleString('en-IN')}</p>
                  <p className="text-[8px] font-bold text-danger leading-none">+{item.percentHigher}% average</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetPredictionWidget;
