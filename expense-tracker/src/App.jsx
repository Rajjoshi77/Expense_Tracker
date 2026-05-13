import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home   from './pages/Home';
import Analysis from './pages/Analysis';
import DogAnimation from './components/DogAnimation';

const SEED = [
  { id: 1, name: 'Team Lunch', amount: 85.50, category: 'Food', type: 'Regular', date: new Date(Date.now() - 86400000 * 1).toISOString(), user: 'Sarah' },
  { id: 2, name: 'Flight to NYC', amount: 320.00, category: 'Travel', type: 'Regular', date: new Date(Date.now() - 86400000 * 2).toISOString(), user: 'Me' },
  { id: 3, name: 'Google Ads Campaign', amount: 150.00, category: 'Marketing', type: 'Recurring', date: new Date(Date.now() - 86400000 * 3).toISOString(), user: 'Alex' },
  { id: 4, name: 'Internet & Cloud', amount: 60.00, category: 'Utilities', type: 'Recurring', date: new Date(Date.now() - 86400000 * 4).toISOString(), user: 'Me' },
  { id: 5, name: 'Coffee & Snacks', amount: 24.75, category: 'Food', type: 'Personal', date: new Date(Date.now() - 86400000 * 5).toISOString(), user: 'Sarah' },
];

function App() {
  const [expenses, setExpenses] = useState(SEED);

  const handleAddExpense = useCallback(exp => {
    setExpenses(p => [{ ...exp, user: 'Me' }, ...p]);
  }, []);

  const handleDeleteExpense = useCallback(id => {
    setExpenses(p => p.filter(e => e.id !== id));
  }, []);

  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home expenses={expenses} onAddExpense={handleAddExpense} onDeleteExpense={handleDeleteExpense} />} />
        <Route path="/analysis" element={<Analysis expenses={expenses} />} />
      </Routes>
      <DogAnimation />
    </div>
  );
}

export default App;
