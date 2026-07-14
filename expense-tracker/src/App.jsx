import { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home   from './pages/Home';
import Analysis from './pages/Analysis';
import AiChat from './pages/AiChat';
import DogAnimation from './components/DogAnimation';
import { expenseApi } from './services/api';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch expenses from backend on mount ──
  useEffect(() => {
    expenseApi.getAll()
      .then(data => setExpenses(data))
      .catch(() => {
        // Backend not running — fall back to local state
        console.warn('Backend not available. Running in local-only mode.');
      })
      .finally(() => setLoading(false));
  }, []);

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

  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />} />
        <Route path="/analysis" element={<Analysis expenses={expenses} />} />
        <Route path="/ai" element={<AiChat />} />
      </Routes>
      <DogAnimation />
    </div>
  );
}

export default App;
