import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import DashboardHero from '../components/DashboardHero';
import SummaryPanel from '../components/SummaryPanel';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import CategoryBreakdown from '../components/CategoryBreakdown';
import CurrencyConverter from '../components/CurrencyConverter';
import groupImg from '../assets/group.jpg';
import logoImg from '../assets/logo.png';

const Home = ({ expenses, onAddExpense, onDeleteExpense }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [convertedAmount, setConvertedAmount] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [copying, setCopying] = useState(false);
  const [notification, setNotification] = useState(null);

  const totalUSD = expenses.reduce((s, e) => s + e.amount, 0);

  const handleAddExpense = useCallback(exp => {
    onAddExpense(exp);
    setNotification('Expense added successfully!');
    setTimeout(() => setNotification(null), 3000);
  }, [onAddExpense]);

  const handleDeleteExpense = useCallback(id => {
    onDeleteExpense(id);
    setNotification('Expense deleted');
    setTimeout(() => setNotification(null), 3000);
  }, [onDeleteExpense]);

  const handleCurrencyChange = useCallback(cur => { setSelectedCurrency(cur); setIsConverting(true); }, []);
  const handleConvertedAmount = useCallback(amt => { setConvertedAmount(amt); setIsConverting(false); }, []);

  const handleGenerateLink = () => {
    const inviteLink = `${window.location.origin}/invite/${Math.random().toString(36).substring(7)}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopying(true);
      setNotification('Invite link copied to clipboard!');
      setTimeout(() => {
        setCopying(false);
        setNotification(null);
      }, 2000);
    });
  };

  return (
    <main className="min-h-screen bg-surface-50 bg-mesh relative">
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[100] px-6 py-3 bg-ink text-white rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl"
          >
            <span className="text-sm font-medium">{notification}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container-app py-8">

        <DashboardHero />

        <div className="mb-10">
          <SummaryPanel
            expenses={expenses}
            convertedAmount={convertedAmount}
            selectedCurrency={selectedCurrency}
            isConverting={isConverting}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-6 lg:col-span-1">
            <ExpenseForm onAddExpense={handleAddExpense} />
            <CategoryBreakdown expenses={expenses} selectedCurrency={selectedCurrency} />

            <div className="card p-5 bg-gradient-to-br from-indigo-600 to-violet-700 text-white overflow-hidden relative group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-heading-sm">Invite your team</h3>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-[10px] font-bold uppercase tracking-wider">
                    <span className="w-1 h-1 rounded-full bg-success animate-pulse" />
                    Live Session
                  </span>
                </div>
                <p className="text-xs text-indigo-100 mb-4 opacity-80">Collaborate on expenses and manage budgets together in real-time.</p>
                <div className="flex -space-x-2 mb-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-indigo-400 flex items-center justify-center text-[10px] font-bold relative">
                      {String.fromCharCode(64 + i)}
                      <span className="absolute bottom-0 right-0 w-2 h-2 bg-success rounded-full border border-indigo-600" />
                    </div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-indigo-500 bg-white text-indigo-600 flex items-center justify-center text-[10px] font-bold">+12</div>
                </div>
                <button
                  onClick={handleGenerateLink}
                  className="w-full py-2 bg-white text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-all active:scale-[0.98]"
                >
                  {copying ? '✓ Link Copied' : 'Generate Invite Link'}
                </button>
              </div>
              <img
                src={groupImg}
                alt="Team"
                className="absolute inset-0 w-full h-full object-cover opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
              />
            </div>

            <CurrencyConverter
              totalUSD={totalUSD}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={handleCurrencyChange}
              onConvertedAmount={handleConvertedAmount}
            />
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-20">
              <ExpenseList expenses={expenses} onDelete={handleDeleteExpense} />
            </div>
          </div>
        </div>

        <motion.footer
          className="mt-16 pt-8 border-t border-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-16 w-auto flex items-center justify-center">
                <img
                  src={logoImg}
                  alt="Spendora Logo"
                  className="h-full w-auto object-contain"
                />
              </div>
              <div className="h-5 w-px bg-border mx-1" />
              <span className="text-ink-muted text-xs">Modern Finance for Startups</span>
            </div>

            <p className="text-caption">
              © {new Date().getFullYear()} Spendora Inc. · Powered by{' '}
              <a
                href="https://www.frankfurter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                Frankfurter
              </a>
            </p>
          </div>
        </motion.footer>
      </div>
    </main>
  );
};

export default Home;
