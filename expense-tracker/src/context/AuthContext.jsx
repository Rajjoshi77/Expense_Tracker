/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        return JSON.parse(stored);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    // Clean up mismatched states if any
    if (token || stored) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    return null;
  });

  const loginWithGoogle = useCallback(async (credential) => {
    try {
      const response = await authApi.loginWithGoogle(credential);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to authenticate with Google' };
    }
  }, []);

  const loginWithSandbox = useCallback(async (email) => {
    try {
      const response = await authApi.loginWithSandbox(email);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return { success: false, error: 'Sandbox login failed' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to log in with Sandbox profile' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading: false, loginWithGoogle, loginWithSandbox, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
export { AuthContext };
