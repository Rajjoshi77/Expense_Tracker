import { useState, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home   from './pages/Home';
import Analysis from './pages/Analysis';
import DogAnimation from './components/DogAnimation';

function App() {
  const [expenses, setExpenses] = useState([]);

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
