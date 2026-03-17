import React, { createContext, useContext, useState } from 'react';

// Global auth context — provides user state and auth actions to all components
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Persist logged-in user across page refreshes via localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('igotNext_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Calls the login endpoint; throws on failure so callers can show error UI
  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    localStorage.setItem('igotNext_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Calls the register endpoint; persists session on success
  const register = async (username, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    localStorage.setItem('igotNext_user', JSON.stringify(data));
    setUser(data);
    return data;
  };

  // Clears user session from both state and localStorage
  const logout = () => {
    localStorage.removeItem('igotNext_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
