import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchExchangeRates, convertAmount } from '../services/currencyApi';
import { CURRENCIES } from '../data/categories';
import Loader from './Loader';

const CurrencyConverter = ({ totalUSD, selectedCurrency, onCurrencyChange, onConvertedAmount }) => {
  const [rates,       setRates]       = useState(null);
  const [loading,     setLoading]     = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isLive,      setIsLive]      = useState(true);

  const loadRates = useCallback(async () => {
    setLoading(true);
    const result = await fetchExchangeRates('USD');
    setRates(result.rates);
    setLastUpdated(result.date);
    setIsLive(result.isLive !== false);
    setLoading(false);
  }, []);

  useEffect(() => { loadRates(); }, [loadRates]);

  useEffect(() => {
    if (!rates) return;
    const val = selectedCurrency === 'USD'
      ? totalUSD
      : convertAmount(totalUSD, 'USD', selectedCurrency, rates);
    onConvertedAmount(val);
  }, [rates, totalUSD, selectedCurrency, onConvertedAmount]);

  const currConfig = CURRENCIES.find(c => c.code === selectedCurrency) || CURRENCIES[0];
  const converted  = rates
    ? (selectedCurrency === 'USD' ? totalUSD : convertAmount(totalUSD, 'USD', selectedCurrency, rates))
    : null;

  return (
    <motion.div
      className="card p-5"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.25 }}
    >
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
            </svg>
          </div>
          <div>
            <h2 className="text-heading-sm text-ink">Currency</h2>
            <p className="text-caption mt-0.5">Live exchange rates</p>
          </div>
        </div>

        <motion.button
          id="refresh-rates"
          onClick={loadRates}
          disabled={loading}
          className="btn-ghost btn-sm w-7 h-7 p-0 rounded-lg"
          whileTap={{ scale: 0.9 }}
          aria-label="Refresh rates"
        >
          <motion.svg
            className="w-3.5 h-3.5"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={loading ? { duration: 1, repeat: Infinity, ease: 'linear' } : {}}
          >
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </motion.svg>
        </motion.button>
      </div>

      <div className="mb-4">
        <p className="label mb-2">Convert to</p>
        <div className="grid grid-cols-5 gap-1.5">
          {CURRENCIES.map(cur => (
            <motion.button
              key={cur.code}
              id={`currency-${cur.code.toLowerCase()}`}
              onClick={() => onCurrencyChange(cur.code)}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl border text-xs font-semibold
                transition-all duration-150
                ${selectedCurrency === cur.code
                  ? 'bg-primary text-white border-primary shadow-primary'
                  : 'bg-surface-50 border-border text-ink-muted hover:border-border-strong hover:text-ink'}`}
              whileTap={{ scale: 0.96 }}
            >
              <span className="text-sm leading-none">{cur.flag}</span>
              <span className="leading-none">{cur.code}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-surface-50 border border-border p-4">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-sm">🇺🇸</div>
          <div>
            <p className="text-caption">From · USD</p>
            <p className="text-sm font-bold font-display text-ink">
              ${totalUSD.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-border" />
          <div className="w-6 h-6 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
            </svg>
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-sm">
            {currConfig.flag}
          </div>
          <div>
            <p className="text-caption">To · {selectedCurrency}</p>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader size="sm" message="" />
                </motion.div>
              ) : (
                <motion.p
                  key={`${converted}-${selectedCurrency}`}
                  className="text-sm font-bold font-display text-primary"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {currConfig.symbol}
                  {converted !== null
                    ? converted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    : '—'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {lastUpdated && (
        <motion.div
          className="flex items-center gap-1.5 mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <svg className={`w-3 h-3 flex-shrink-0 ${isLive ? 'text-success-500' : 'text-warning'}`}
            fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"/>
          </svg>
          <p className="text-caption">
            {isLive ? `Live · ${lastUpdated} · Frankfurter API` : `Approx. rates · Offline mode`}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CurrencyConverter;
