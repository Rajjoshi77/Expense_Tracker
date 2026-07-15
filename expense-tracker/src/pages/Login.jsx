import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const MOCK_PROFILES = [
  {
    email: 'raj@example.com',
    name: 'Raj Joshi',
    role: 'Lead Developer',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'
  },
  {
    email: 'sarah@example.com',
    name: 'Sarah Jenkins',
    role: 'Product Manager',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80'
  },
  {
    email: 'alex@example.com',
    name: 'Alex Mercer',
    role: 'UX Designer',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80'
  }
];

const Login = () => {
  const { loginWithGoogle, loginWithSandbox, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleCredentialResponse = async (response) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginWithGoogle(response.credential);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Google Sign-In failed.');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleSandboxLogin = async (email) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginWithSandbox(email);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Sandbox login failed.');
      }
    } catch {
      setError('An error occurred during sandbox login.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Dynamically load Google Identity Services library
    const scriptId = 'google-gsi-client-script';
    let script = document.getElementById(scriptId);

    const initializeGoogleSignIn = () => {
      if (window.google) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '4718228399-dummyclientid.apps.googleusercontent.com';
        
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const container = document.getElementById('google-signin-btn');
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            shape: 'pill',
            text: 'signin_with',
            logo_alignment: 'left'
          });
        }
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    } else {
      initializeGoogleSignIn();
    }

    return () => {
      // Clean up window hooks if needed
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 bg-mesh relative p-4 overflow-hidden">
      {/* Background circles decoration */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-secondary-50 opacity-40 blur-3xl pointer-events-none animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md card p-8 backdrop-blur-2xl border border-white/20 bg-white/70 shadow-2xl relative z-10 flex flex-col items-center text-center"
      >
        {/* Logo */}
        <div className="mb-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-100 mb-3">
            🍹
          </div>
          <h1 className="text-2xl font-black tracking-tight text-ink">Mojito Spendora</h1>
          <p className="text-xs text-ink-muted mt-1">Smart Cashflow & Budget Management</p>
        </div>

        {error && (
          <div className="w-full mb-4 p-3 rounded-xl bg-danger-50 border border-danger-100 text-xs font-semibold text-danger text-left flex gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Auth section */}
        <div className="w-full space-y-4 mb-8">
          <div className="text-xs font-bold text-ink-muted uppercase tracking-wider mb-2">Secure Authentication</div>
          
          {/* Custom Wrapper for Google Button to style it */}
          <div className="w-full flex justify-center relative min-h-[44px]">
            {loading && (
              <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center rounded-full border border-slate-200">
                <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            )}
            <div id="google-signin-btn" className="w-full" />
          </div>
        </div>

        <div className="w-full flex items-center gap-2 mb-6">
          <div className="h-px bg-slate-200 flex-1" />
          <span className="text-[10px] text-ink-muted uppercase tracking-wider font-extrabold shrink-0">OR LOGIN VIA SANDBOX</span>
          <div className="h-px bg-slate-200 flex-1" />
        </div>

        {/* Sandbox quick access presets */}
        <div className="w-full space-y-3">
          <div className="text-[11px] text-ink-muted mb-2">
            No OAuth credentials? Login instantly to a Sandbox profile:
          </div>
          
          <div className="flex flex-col gap-2">
            {MOCK_PROFILES.map((profile) => (
              <button
                key={profile.email}
                disabled={loading}
                onClick={() => handleSandboxLogin(profile.email)}
                className="w-full p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all hover:scale-[1.01] hover:shadow-sm text-left flex items-center gap-3 group"
              >
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-100"
                />
                <div className="flex-1">
                  <div className="text-xs font-bold text-ink group-hover:text-primary transition-colors">{profile.name}</div>
                  <div className="text-[10px] text-ink-muted leading-tight">{profile.role}</div>
                </div>
                <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full opacity-60 group-hover:opacity-100 transition-opacity">
                  Connect
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-[10px] text-ink-muted leading-relaxed">
          OAuth configurations can be customized in <code className="bg-slate-100 px-1 py-0.5 rounded">.env</code> on your local deployment.
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
