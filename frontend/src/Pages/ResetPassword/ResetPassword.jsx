import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const token = new URLSearchParams(window.location.search).get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      setError('Please fill in both fields');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (!token) {
      setError('Invalid or missing reset token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/reset-password`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, newPassword: password }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => navigate('/signin'), 3000);
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
    <div className="rp-page">
      <div className="rp-card">
        <h2 className="rp-title">Reset Password</h2>

        {success ? (
          <div className="rp-success">
            <div className="rp-success-icon">✅</div>
            <p>Password reset successfully! Redirecting you to sign in...</p>
          </div>
        ) : (
          <>
            <p className="rp-subtitle">Enter your new password below.</p>
            <form onSubmit={handleSubmit} className="rp-form">
              <div className="rp-field">
                <label className="rp-label">New Password</label>
                <input
                  className="rp-input"
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="rp-field">
                <label className="rp-label">Confirm Password</label>
                <input
                  className="rp-input"
                  type="password"
                  placeholder="Repeat your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="rp-error">{error}</p>}
              <button className="rp-btn" type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}