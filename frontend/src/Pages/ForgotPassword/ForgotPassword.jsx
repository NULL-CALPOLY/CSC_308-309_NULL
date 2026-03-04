import React, { useState } from 'react';
import './ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/forgot-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <h2 className="fp-title">Forgot Password</h2>

        {submitted ? (
          <div className="fp-success">
            <div className="fp-success-icon">✅</div>
            <p>Check your email! If an account exists for <strong>{email}</strong>, we sent a reset link.</p>
            <a href="/signin" className="fp-link">Back to Sign In</a>
          </div>
        ) : (
          <>
            <p className="fp-subtitle">
              Enter your email and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleSubmit} className="fp-form">
              <div className="fp-field">
                <label className="fp-label">Email</label>
                <input
                  className="fp-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {error && <p className="fp-error">{error}</p>}
              <button className="fp-btn" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <a href="/signin" className="fp-link">Back to Sign In</a>
          </>
        )}
      </div>
    </div>
  );
}