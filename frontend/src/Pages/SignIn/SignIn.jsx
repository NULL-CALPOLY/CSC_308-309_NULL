import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth';
import './SignIn.css';
import Navbar from '../../Components/Navbar/Navbar.jsx';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Navbar />
      <div className="signin-container">
        <form onSubmit={handleSubmit} className="signin-form">
          <h2>Sign In</h2>

          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />

          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {errorMsg && (
            <p style={{ marginTop: '0.75rem', color: '#ff6b6b' }}>{errorMsg}</p>
          )}
        </form>
      </div>
    </div>
  );
}
