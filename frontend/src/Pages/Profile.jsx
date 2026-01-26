import React, { useState, useEffect } from 'react';
import './Profile.css';

export default function Profile() {
  const USER_ID = '695ea916d421330d6bd92a4b'; // 👈 Replace with function to utilize id from sign in

  // User state
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [DOB, setDOB] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`http://localhost:3000/users/${USER_ID}`);
        const json = await res.json();

        if (!res.ok || !json.success) throw new Error(json.message || 'User not found');

        const user = json.data;

        setName(user.name || '');
        setPhoneNumber(user.phoneNumber || '');
        setDOB(user.DOB ? new Date(user.DOB).toISOString().substr(0, 10) : '');
        setGender(user.gender || '');
        setCity(user.city || '');
        setEmail(user.email || '');
        setInterests(Array.isArray(user.interests) ? user.interests : []);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  // Handle update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch(`http://localhost:3000/users/${USER_ID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phoneNumber,
          DOB,
          gender,
          city,
          email,
          interests,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update profile');

      const updatedUser = json.data;

      // Update local state from DB
      setName(updatedUser.name || '');
      setPhoneNumber(updatedUser.phoneNumber || '');
      setDOB(updatedUser.DOB ? new Date(updatedUser.DOB).toISOString().substr(0, 10) : '');
      setGender(updatedUser.gender || '');
      setCity(updatedUser.city || '');
      setEmail(updatedUser.email || '');
      setInterests(Array.isArray(updatedUser.interests) ? updatedUser.interests : []);

      setIsEditing(false); // exit edit mode
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-container">Loading profile…</div>;
  if (errorMsg) return <div className="profile-container error">{errorMsg}</div>;

  return (
    <div className="container">
      <div className="profile-container">
        <form onSubmit={handleSubmit} className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {(name?.charAt(0) || '?').toUpperCase()}
            </div>
            <div>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Name"
                  required
                />
              ) : (
                <h2>{name}</h2>
              )}
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                  required
                />
              ) : (
                <p className="profile-email">{email}</p>
              )}
            </div>
          </div>

          <div className="profile-grid">
            {/* Phone */}
            <div className="profile-field">
              <label>Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Phone number"
                />
              ) : (
                <span>{phoneNumber || '—'}</span>
              )}
            </div>

            {/* DOB */}
            <div className="profile-field">
              <label>Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={DOB}
                  onChange={(e) => setDOB(e.target.value)}
                />
              ) : (
                <span>{DOB ? new Date(DOB).toLocaleDateString() : '—'}</span>
              )}
            </div>

            {/* Gender */}
            <div className="profile-field">
              <label>Gender</label>
              {isEditing ? (
                <select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              ) : (
                <span>{gender || '—'}</span>
              )}
            </div>

            {/* City */}
            <div className="profile-field">
              <label>City</label>
              {isEditing ? (
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              ) : (
                <span>{city || '—'}</span>
              )}
            </div>

            {/* Interests */}
            <div className="profile-field full">
              <label>Interests</label>
              {isEditing ? (
                <input
                  type="text"
                  value={interests.join(', ')}
                  onChange={(e) =>
                    setInterests(e.target.value.split(',').map((i) => i.trim()))
                  }
                  placeholder="Comma-separated interests"
                />
              ) : (
                <span>{interests.length ? interests.join(', ') : '—'}</span>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="profile-edit-btn"
            onClick={(e) => {
              if (!isEditing) {
                e.preventDefault();
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? (loading ? 'Saving…' : 'Save Profile') : 'Edit Profile'}
          </button>

          {errorMsg && <p className="error">{errorMsg}</p>}
        </form>
      </div>
    </div>
  );
}
