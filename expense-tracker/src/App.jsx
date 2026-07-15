import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home   from './pages/Home';
import Analysis from './pages/Analysis';
import AiChat from './pages/AiChat';
import Import from './pages/Import';
import Login from './pages/Login';
import DogAnimation from './components/DogAnimation';
import { expenseApi, incomeApi } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);

  // ── Fetch expenses & incomes from backend on mount ──
  const refreshData = useCallback(() => {
    if (!isAuthenticated) return Promise.resolve();
    return Promise.all([expenseApi.getAll(), incomeApi.getAll()])
      .then(([expData, incData]) => {
        setExpenses(expData);
        setIncomes(incData);
      })
      .catch(() => {
        console.warn('Backend not available. Running in local-only mode.');
      });
  }, [isAuthenticated]);

  useEffect(() => {
    let active = true;
    if (!isAuthenticated) return;

    Promise.all([expenseApi.getAll(), incomeApi.getAll()])
      .then(([expData, incData]) => {
        if (active) {
          setExpenses(expData);
          setIncomes(incData);
        }
      })
      .catch(() => {
        console.warn('Backend not available. Running in local-only mode.');
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const handleAddExpense = useCallback(async (exp) => {
    try {
      // Try to save to backend
      const saved = await expenseApi.create({
        name: exp.name,
        amount: exp.amount,
        category: exp.category,
        type: exp.type,
        date: exp.date,
        merchant: exp.merchant,
        note: exp.note,
      });
      setExpenses(p => [saved, ...p]);
    } catch {
      // Fallback: add locally if backend is down
      setExpenses(p => [{ ...exp, id: String(Date.now()), user: 'Me' }, ...p]);
    }
  }, []);

  const handleDeleteExpense = useCallback(async (id) => {
    try {
      await expenseApi.delete(id);
    } catch {
      // Continue with local delete even if backend fails
    }
    setExpenses(p => p.filter(e => e.id !== id));
  }, []);

  const handleAddIncome = useCallback(async (inc) => {
    try {
      const saved = await incomeApi.create({
        source: inc.source,
        amount: inc.amount,
        date: inc.date,
        isRecurring: inc.isRecurring || false,
        note: inc.note || '',
      });
      setIncomes(p => [saved, ...p]);
    } catch {
      setIncomes(p => [{ ...inc, id: String(Date.now()), source: inc.source }, ...p]);
    }
  }, []);

  const handleDeleteIncome = useCallback(async (id) => {
    try {
      await incomeApi.delete(id);
    } catch {
      // Fallback
    }
    setIncomes(p => p.filter(i => i.id !== id));
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      <Navbar />
      <Routes>
        <Route 
          path="/" 
          element={
            <Home 
              expenses={expenses} 
              incomes={incomes}
              onAddExpense={handleAddExpense} 
              onDeleteExpense={handleDeleteExpense} 
              onAddIncome={handleAddIncome}
              onDeleteIncome={handleDeleteIncome}
            />
          } 
        />
        <Route path="/analysis" element={<Analysis expenses={expenses} incomes={incomes} />} />
        <Route path="/ai" element={<AiChat />} />
        <Route path="/import" element={<Import onImportSuccess={refreshData} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DogAnimation />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
