import { useState } from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import passportImg from '../assets/passport size.jpg';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-surface/90 backdrop-blur-md border-b border-border">
      <div className="container-app">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="h-14 w-auto flex items-center justify-center py-1">
              <img 
                src={logoImg} 
                alt="Spendora Logo" 
                className="h-full w-auto object-contain"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted hover:text-ink hover:bg-surface'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/analysis"
              className={({ isActive }) => 
                `px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted hover:text-ink hover:bg-surface'}`
              }
            >
              Analysis
            </NavLink>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-pill bg-success-50 border border-success-100">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-dot" />
              <span className="text-xs font-medium text-success-600">Live</span>
            </div>

            <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-border shadow-primary">
              <img 
                src={passportImg} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>

            <button
              className="md:hidden btn-ghost btn-sm px-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                {mobileOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                }
              </svg>
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <motion.div
            className="md:hidden py-2 border-t border-border flex flex-col gap-1"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.15 }}
          >
            <NavLink
              to="/"
              className={({ isActive }) => `block px-4 py-2 text-sm rounded-md ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted'}`}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/analysis"
              className={({ isActive }) => `block px-4 py-2 text-sm rounded-md ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted'}`}
              onClick={() => setMobileOpen(false)}
            >
              Analysis
            </NavLink>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
