import Navbar from './components/Navbar';
import Home   from './pages/Home';
import DogAnimation from './components/DogAnimation';

function App() {
  return (
    <div className="min-h-screen bg-surface-50 font-sans">
      <Navbar />
      <Home />
      <DogAnimation />
    </div>
  );
}

export default App;
