import { useState } from 'react';
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

const fieldCls = 'bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.12)] rounded-[8px] py-[0.6rem] px-3 text-white text-[0.9rem] font-[inherit] resize-y transition-[border-color,box-shadow] duration-200 outline-none focus:border-[rgba(124,58,237,0.55)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12)]';
const selectCls = `${fieldCls} pr-8 appearance-none cursor-pointer`;

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
    <div
      className="fixed inset-0 z-[2000] bg-[rgba(0,0,0,0.65)] backdrop-blur-[4px] flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}>
      <div
        className="relative bg-[#111] border border-[rgba(255,255,255,0.1)] rounded-2xl p-8 w-full max-w-[540px] max-h-[calc(100vh-2rem)] overflow-y-auto text-white shadow-[0_24px_60px_rgba(0,0,0,0.5)] max-[480px]:px-5 max-[480px]:py-6"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="m-0 text-[1.4rem]">Register your club</h2>
          <button
            className="bg-none border-none text-[rgba(255,255,255,0.5)] text-[1.1rem] cursor-pointer hover:text-white"
            onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="mt-2 mb-5 text-[rgba(255,255,255,0.5)] text-[0.85rem]">
          Submissions are reviewed by a Findr admin before going live.
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <label className="flex flex-col gap-[0.35rem]">
            <span className="text-[0.82rem] text-[rgba(255,255,255,0.6)]">Club name *</span>
            <input className={fieldCls} value={form.name} onChange={update('name')} required />
          </label>

          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <label className="flex flex-col gap-[0.35rem]">
              <span className="text-[0.82rem] text-[rgba(255,255,255,0.6)]">Contact email *</span>
              <input
                className={fieldCls}
                type="email"
                value={form.email}
                onChange={update('email')}
                required
              />
            </label>
            <label className="flex flex-col gap-[0.35rem]">
              <span className="text-[0.82rem] text-[rgba(255,255,255,0.6)]">Phone</span>
              <input className={fieldCls} value={form.phone} onChange={update('phone')} />
            </label>
          </div>

          <label className="flex flex-col gap-[0.35rem]">
            <span className="text-[0.82rem] text-[rgba(255,255,255,0.6)]">Category</span>
            <select className={selectCls} value={form.category} onChange={update('category')}
              style={{backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundRepeat:'no-repeat', backgroundPosition:'right 0.75rem center'}}>
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} style={{background:'#111'}}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-[0.35rem]">
            <span className="text-[0.82rem] text-[rgba(255,255,255,0.6)]">Description</span>
            <textarea
              className={fieldCls}
              rows={4}
              maxLength={1000}
              value={form.description}
              onChange={update('description')}
              placeholder="What is your club about?"
            />
          </label>

          <label className="flex items-start gap-[0.6rem] text-[0.85rem] text-[rgba(255,255,255,0.75)] cursor-pointer">
            <input
              className="mt-[0.15rem]"
              type="checkbox"
              checked={form.studentOnly}
              onChange={update('studentOnly')}
            />
            <span>
              Students only — only verified students can join &amp; see our events
            </span>
          </label>

          {error && <p className="text-[#f87171] text-[0.85rem] m-0">{error}</p>}

          <div className="flex justify-end gap-3 mt-2">
            <button
              type="button"
              className="py-[0.6rem] px-5 rounded-[8px] font-semibold cursor-pointer border border-[rgba(255,255,255,0.2)] bg-transparent text-[rgba(255,255,255,0.7)] hover:text-white hover:border-[rgba(255,255,255,0.4)] transition-all duration-200"
              onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="py-[0.6rem] px-5 rounded-[8px] font-semibold cursor-pointer border-none bg-[#7c3aed] text-white disabled:opacity-60 disabled:cursor-default transition-all duration-200 hover:bg-[#6d28d9]"
              disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
