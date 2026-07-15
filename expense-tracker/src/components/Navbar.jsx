import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import passportImg from '../assets/passport size.jpg';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth();

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
            <NavLink
              to="/ai"
              className={({ isActive }) => 
                `px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted hover:text-ink hover:bg-surface'}`
              }
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI Assistant
            </NavLink>
            <NavLink
              to="/import"
              className={({ isActive }) => 
                `px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors duration-150 flex items-center gap-1.5 ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted hover:text-ink hover:bg-surface'}`
              }
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Scan & Import
            </NavLink>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-pill bg-success-50 border border-success-100">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse-dot" />
              <span className="text-xs font-medium text-success-600">Live</span>
            </div>

            {/* Profile Dropdown Widget */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden border border-border shadow-primary flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary/50 transition-transform active:scale-95"
              >
                <img 
                  src={user?.avatarUrl || passportImg} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              </button>
              
              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    {/* Click backdrop to close */}
                    <div className="fixed inset-0 z-30" onClick={() => setDropdownOpen(false)} />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200/80 rounded-2xl shadow-xl py-2 z-40 text-left"
                    >
                      <div className="px-4 py-2.5 border-b border-slate-100 mb-1.5">
                        <p className="text-xs font-bold text-ink truncate leading-tight">{user?.name || 'Developer'}</p>
                        <p className="text-[10px] text-ink-muted truncate mt-0.5">{user?.email || 'dev@example.com'}</p>
                      </div>
                      
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-bold text-danger hover:bg-danger-50 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
            <NavLink
              to="/ai"
              className={({ isActive }) => `flex items-center gap-1.5 px-4 py-2 text-sm rounded-md ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted'}`}
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              AI Assistant
            </NavLink>
            <NavLink
              to="/import"
              className={({ isActive }) => `flex items-center gap-1.5 px-4 py-2 text-sm rounded-md ${isActive ? 'text-primary bg-primary-50' : 'text-ink-muted'}`}
              onClick={() => setMobileOpen(false)}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Scan & Import
            </NavLink>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
