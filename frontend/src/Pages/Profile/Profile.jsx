import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './Profile.css';
import { useAuth } from '../../Hooks/useAuth';
import Navbar from '../../Components/Navbar/Navbar';

export default function Profile() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setdateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { user, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Don't fetch if not authenticated or still checking auth
    if (authLoading) return;

    if (!isAuthenticated || !user?.id) {
      setErrorMsg('Please log in to view your profile');
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await fetch(`http://localhost:3000/users/${user.id}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const json = await res.json();

        if (!res.ok || !json.success)
          throw new Error(json.message || 'User not found');

        const userData = json.data;

        setName(userData.name || '');
        setPhoneNumber(userData.phoneNumber || '');
        setdateOfBirth(userData.dateOfBirth || '');
        setGender(userData.gender || '');
        setCity(userData.city || '');
        setEmail(userData.email || '');
        setInterests(
          Array.isArray(userData.interests) ? userData.interests : []
        );
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, isAuthenticated, authLoading]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInterestInput(value);

    const cleaned = value
      .split(',')
      .map((i) => i.trim())
      .filter((i) => i.length > 0);
    setInterests(cleaned);
  };

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
          dateOfBirth,
          gender,
          city,
          email,
          interests,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to update profile');

      const updatedUser = json.data;

      setName(updatedUser.name || '');
      setPhoneNumber(updatedUser.phoneNumber || '');
      setdateOfBirth(updatedUser.dateOfBirth || '');
      setGender(updatedUser.gender || '');
      setCity(updatedUser.city || '');
      setEmail(updatedUser.email || '');
      setInterests(
        Array.isArray(updatedUser.interests) ? updatedUser.interests : []
      );

      setIsEditing(false); // exit edit mode
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="profile-container">Loading profile…</div>;
  if (errorMsg)
    return <div className="profile-container error">{errorMsg}</div>;

  return (
    <div>
      <Navbar page='/home'/>
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
              <div className="profile-field">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => {
                      const digitsOnly = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);
                      setPhoneNumber(digitsOnly);
                    }}
                    placeholder="Phone number"
                  />
                ) : (
                  <span>{phoneNumber || '—'}</span>
                )}
              </div>

              <div className="profile-field">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setdateOfBirth(e.target.value)}
                  />
                ) : (
                  <span>{dateOfBirth?.split('T')[0] ?? '—'}</span>
                )}
              </div>

              <div className="profile-field">
                <label>Gender</label>
                {isEditing ? (
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}>
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

              <div className="profile-field full">
                <label>Interests</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={interestInput}
                    onChange={handleInputChange}
                    placeholder="Enter your interests"
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
                  setInterestInput(interests.join(', ')); // 👈 THIS LINE
                  setIsEditing(true);
                }
              }}>
              {isEditing
                ? loading
                  ? 'Saving…'
                  : 'Save Profile'
                : 'Edit Profile'}
            </button>

            {errorMsg && <p className="error">{errorMsg}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
