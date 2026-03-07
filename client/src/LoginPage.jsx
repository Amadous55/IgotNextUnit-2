import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(loginForm.username, loginForm.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(registerForm.username, registerForm.email, registerForm.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">🏀</div>
        <h1 className="login-title">IgotNext</h1>
        <p className="login-subtitle">Find your next run</p>

        <div className="login-tabs">
          <button
            className={`login-tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => { setTab('login'); setError(''); }}
          >
            Log In
          </button>
          <button
            className={`login-tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => { setTab('register'); setError(''); }}
          >
            Sign Up
          </button>
        </div>

        {error && <p className="login-error">{error}</p>}

        {tab === 'login' ? (
          <form className="login-form" onSubmit={handleLogin}>
            <input
              className="login-input"
              type="text"
              placeholder="Username"
              value={loginForm.username}
              onChange={e => setLoginForm({ ...loginForm, username: e.target.value })}
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
              required
            />
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form className="login-form" onSubmit={handleRegister}>
            <input
              className="login-input"
              type="text"
              placeholder="Username"
              value={registerForm.username}
              onChange={e => setRegisterForm({ ...registerForm, username: e.target.value })}
              required
            />
            <input
              className="login-input"
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
              required
            />
            <input
              className="login-input"
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
              required
            />
            <button className="login-submit" type="submit" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}

        <button className="login-skip" onClick={() => navigate('/')}>
          Continue without account →
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
