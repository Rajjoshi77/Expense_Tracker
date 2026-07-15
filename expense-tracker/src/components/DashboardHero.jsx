import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import phoneImg from '../assets/phone_image.png';

const MUX_ANIMATED_URL = "https://image.mux.com/xOF6u3LVZZaZpwG027R7oeyOZgDDrFSq5300GYPWeanTg/animated.webp";

const DashboardHero = ({ onGetStarted }) => {
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl bg-surface border border-border shadow-card p-8 lg:p-12">
      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-10">

        <div className="flex-1 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-pill bg-primary-50 border border-primary-100 text-primary text-xs font-bold uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              New Feature: AI Insights
            </span>
            <h1 className="text-display-lg text-ink mb-4">
              Manage expenses with <span className="text-gradient-primary">intelligence.</span>
            </h1>
            <p className="text-body-lg mb-8 max-w-xl mx-auto lg:mx-0">
              The next generation of finance management. Track, analyze, and optimize your spending with our premium dashboard.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button onClick={onGetStarted} className="btn-primary btn-xl">Get Started Free</button>
              <button onClick={() => setShowDemoModal(true)} className="btn-secondary btn-xl">Watch Demo</button>
            </div>
          </motion.div>
        </div>

        <div className="flex-1 relative w-full max-w-2xl">
          <motion.div
            onClick={() => setShowDemoModal(true)}
            className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white aspect-video bg-slate-100 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Animated Background Image (Video Feel) */}
            <motion.img
              src={MUX_ANIMATED_URL}
              alt="Dashboard Preview"
              className="w-full h-full object-cover"
              animate={{
                scale: [1, 1.1, 1],
                x: [0, -10, 0],
                y: [0, -5, 0]
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
              animate={{ x: ['100%', '-100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
            />

            <div className="absolute inset-0 bg-ink/10 group-hover:bg-ink/5 transition-colors flex items-center justify-center">
              <motion.div
                className="w-16 h-16 rounded-full bg-white/90 backdrop-blur shadow-xl flex items-center justify-center transition-transform group-hover:scale-110"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <svg className="w-6 h-6 text-primary ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.333-5.89a1.5 1.5 0 000-2.538L6.3 2.841z" />
                </svg>
              </motion.div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-2 pointer-events-none">
              <div className="flex items-center justify-between">
                <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] font-medium">
                  02:45 / 05:12
                </div>
                <div className="flex gap-1.5">
                  {[1, 2, 3].map(i => (
                    <motion.div
                      key={i}
                      className="w-1 h-1 rounded-full bg-white/60"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                    />
                  ))}
                </div>
              </div>
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="absolute -bottom-6 -left-6 w-32 md:w-48 z-20 pointer-events-none"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <img src={phoneImg} alt="Mobile App" className="w-full h-auto drop-shadow-2xl" />
          </motion.div>
        </div>
      </div>

      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary-50/30 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-secondary-50 opacity-50 blur-3xl pointer-events-none" />

      {/* Demo Video Modal */}
      <AnimatePresence>
        {showDemoModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-md"
            onClick={() => setShowDemoModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-surface rounded-3xl overflow-hidden shadow-2xl border border-border flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-border bg-surface-50">
                <div className="text-left">
                  <h3 className="text-heading-sm text-ink font-bold">Mojito Expense Tracker - Walkthrough</h3>
                  <p className="text-[11px] text-ink-muted">Learn how to track cashflow, scan receipts, and use AI forecasting.</p>
                </div>
                <button
                  onClick={() => setShowDemoModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200/80 transition-colors flex items-center justify-center text-ink"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black relative">
                <video
                  src="/demo_spendora.mp4"
                  className="w-full h-full object-cover"
                  autoPlay
                  controls
                  loop
                />
              </div>

              {/* Modal Footer with quick features */}
              <div className="p-6 bg-surface-50 grid grid-cols-3 gap-4 border-t border-border text-center">
                <div className="p-3 bg-white border border-border/80 rounded-2xl">
                  <span className="text-lg">🤖</span>
                  <h4 className="text-xs font-bold text-ink mt-1">Smart AI Insights</h4>
                  <p className="text-[10px] text-ink-muted">Get automated alerts on anomaly spikes & spend projections.</p>
                </div>
                <div className="p-3 bg-white border border-border/80 rounded-2xl">
                  <span className="text-lg">📸</span>
                  <h4 className="text-xs font-bold text-ink mt-1">Receipt Scanner</h4>
                  <p className="text-[10px] text-ink-muted">Instantly scan invoice PDFs and images into records.</p>
                </div>
                <div className="p-3 bg-white border border-border/80 rounded-2xl">
                  <span className="text-lg">📈</span>
                  <h4 className="text-xs font-bold text-ink mt-1">Net Savings Charts</h4>
                  <p className="text-[10px] text-ink-muted">Track monthly inflows against outflows with real-time conversion.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default DashboardHero;
