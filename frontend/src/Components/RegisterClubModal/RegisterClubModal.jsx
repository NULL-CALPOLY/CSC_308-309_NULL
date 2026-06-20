import { useState } from 'react';
import './RegisterClubModal.css';
import { useAuth } from '../../Hooks/UseAuth.ts';

const API = import.meta.env.VITE_API_BASE_URL;

const CATEGORIES = [
  'Academic',
  'Sports & Recreation',
  'Arts & Music',
  'Cultural',
  'Greek Life',
  'Service & Volunteering',
  'Professional',
  'Gaming',
  'Other',
];

export default function RegisterClubModal({ isOpen, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    description: '',
    studentOnly: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const update = (field) => (e) =>
    setForm((f) => ({
      ...f,
      [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim()) {
      setError('Club name and contact email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to register club');
      onSuccess?.(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rcm-overlay" onClick={onClose}>
      <div className="rcm-card" onClick={(e) => e.stopPropagation()}>
        <div className="rcm-header">
          <h2>Register your club</h2>
          <button className="rcm-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="rcm-note">
          Submissions are reviewed by a Findr admin before going live.
        </p>

        <form className="rcm-form" onSubmit={handleSubmit} noValidate>
          <label className="rcm-field">
            <span>Club name *</span>
            <input value={form.name} onChange={update('name')} required />
          </label>

          <div className="rcm-grid">
            <label className="rcm-field">
              <span>Contact email *</span>
              <input
                type="email"
                value={form.email}
                onChange={update('email')}
                required
              />
            </label>
            <label className="rcm-field">
              <span>Phone</span>
              <input value={form.phone} onChange={update('phone')} />
            </label>
          </div>

          <label className="rcm-field">
            <span>Category</span>
            <select value={form.category} onChange={update('category')}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="rcm-field">
            <span>Description</span>
            <textarea
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={update('description')}
              placeholder="What is your club about?"
            />
          </label>

          <label className="rcm-checkbox">
            <input
              type="checkbox"
              checked={form.studentOnly}
              onChange={update('studentOnly')}
            />
            <span>
              Students only — only verified students can join &amp; see our
              events
            </span>
          </label>

          {error && <p className="rcm-error">{error}</p>}

          <div className="rcm-actions">
            <button
              type="button"
              className="rcm-btn rcm-btn--ghost"
              onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="rcm-btn rcm-btn--primary"
              disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
