import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../../Hooks/UseAuth.ts';
import Navbar from '../../Components/Navbar/Navbar';
import ProfileImageUploadModal from '../../Components/Modals/ProfileImageUploadModal/ProfileImageUploadModal';

export default function Profile() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePublicId, setProfileImagePublicId] = useState(null); // Cloudinary publicId
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    updateProfileImage,
    updateProfileName,
  } = useAuth();

  useEffect(() => {
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
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const json = await res.json();
        if (!res.ok || !json.success)
          throw new Error(json.message || 'User not found');

        const u = json.data;
        setName(u.name || '');
        setPhoneNumber(u.phoneNumber || '');
        setDateOfBirth(u.dateOfBirth || '');
        setGender(u.gender || '');
        setCity(u.city || '');
        setEmail(u.email || '');
        setProfileImage(u.profileImage || null);
        setProfileImagePublicId(u.profileImagePublicId || null); // load existing publicId
        setInterests(Array.isArray(u.interests) ? u.interests : []);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user, isAuthenticated, authLoading]);

  // ── After upload success: persist to DB and sync navbar ──
  // The modal already handled Cloudinary (POST for new, PATCH+delete for existing).
  // Here we just save the returned imageUrl + publicId to the user document.
  const handleImageUploadSuccess = async (result) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            profileImage: result.imageUrl,
            profileImagePublicId: result.publicId,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to save image');

      setProfileImage(result.imageUrl);
      setProfileImagePublicId(result.publicId);
      updateProfileImage(result.imageUrl); // sync navbar avatar
      setShowImageUpload(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleInterestInput = (e) => {
    const val = e.target.value;
    setInterestInput(val);
    setInterests(
      val
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`,
        {
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
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to update profile');

      const u = json.data;
      setName(u.name || '');
      setPhoneNumber(u.phoneNumber || '');
      setDateOfBirth(u.dateOfBirth || '');
      setGender(u.gender || '');
      setCity(u.city || '');
      setEmail(u.email || '');
      setInterests(Array.isArray(u.interests) ? u.interests : []);
      setIsEditing(false);
      updateProfileName(u.name); // sync navbar initial
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = () => {
    setInterestInput(interests.join(', '));
    setIsEditing(true);
    setErrorMsg('');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setErrorMsg('');
  };

  if (authLoading || loading)
    return <div className="profile-loading">Loading…</div>;
  if (errorMsg && !name)
    return <div className="profile-loading">{errorMsg}</div>;

  return (
    <div className="profile-page">
      <Navbar page="/" />

      <div className="profile-layout">
        {/* ── Sidebar ── */}
        <aside className="profile-sidebar">
          <div className="profile-sidebar-card">
            {/* Clickable avatar → opens image upload modal */}
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => setShowImageUpload(true)}
              title="Change photo">
              <div className="profile-avatar-ring" />
              <div className="profile-avatar-inner">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="profile-avatar-img"
                  />
                ) : (
                  <div className="profile-avatar-initials">
                    {(name?.charAt(0) || '?').toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-avatar-overlay">
                <span className="overlay-icon">✎</span>
                <span className="overlay-text">Edit</span>
              </div>
            </button>

            <p className="sidebar-name">{name || '—'}</p>
            <p className="sidebar-email">{email}</p>

            {(interests.length > 0 || city) && (
              <div className="sidebar-stats">
                {interests.length > 0 && (
                  <span className="sidebar-stat">
                    {interests.length} interest
                    {interests.length !== 1 ? 's' : ''}
                  </span>
                )}
                {city && <span className="sidebar-stat">{city}</span>}
              </div>
            )}

            {!isEditing && (
              <button className="profile-btn--sidebar" onClick={startEditing}>
                Edit Profile
              </button>
            )}
          </div>
        </aside>

        {/* ── Main form ── */}
        <form className="profile-main" onSubmit={handleSubmit} noValidate>
          {/* Panel: Personal Information */}
          <div className="profile-panel">
            <div className="profile-panel-header">
              <span className="panel-dot" />
              <h3>Personal Information</h3>
            </div>
            <div className="profile-panel-body">
              <div className="profile-field">
                <label>Full Name</label>
                {isEditing ? (
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    required
                  />
                ) : (
                  <span
                    className={`profile-field-value ${!name ? 'empty' : ''}`}>
                    {name || 'Not set'}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label>Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    required
                  />
                ) : (
                  <span
                    className={`profile-field-value ${!email ? 'empty' : ''}`}>
                    {email || 'Not set'}
                  </span>
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
                  <span
                    className={`profile-field-value ${!gender ? 'empty' : ''}`}>
                    {gender || 'Not set'}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label>Date of Birth</label>
                {isEditing ? (
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                ) : (
                  <span
                    className={`profile-field-value ${!dateOfBirth ? 'empty' : ''}`}>
                    {dateOfBirth?.split('T')[0] || 'Not set'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Panel: Contact & Location */}
          <div className="profile-panel">
            <div className="profile-panel-header">
              <span className="panel-dot" />
              <h3>Contact & Location</h3>
            </div>
            <div className="profile-panel-body">
              <div className="profile-field">
                <label>Phone</label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) =>
                      setPhoneNumber(
                        e.target.value.replace(/\D/g, '').slice(0, 10)
                      )
                    }
                    placeholder="Phone number"
                  />
                ) : (
                  <span
                    className={`profile-field-value ${!phoneNumber ? 'empty' : ''}`}>
                    {phoneNumber || 'Not set'}
                  </span>
                )}
              </div>

              <div className="profile-field">
                <label>City</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                  />
                ) : (
                  <span
                    className={`profile-field-value ${!city ? 'empty' : ''}`}>
                    {city || 'Not set'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Panel: Interests */}
          <div className="profile-panel">
            <div className="profile-panel-header">
              <span className="panel-dot" />
              <h3>Interests</h3>
            </div>
            <div className="profile-panel-body single">
              <div className="profile-field">
                {isEditing ? (
                  <>
                    <label>Comma-separated</label>
                    <input
                      type="text"
                      value={interestInput}
                      onChange={handleInterestInput}
                      placeholder="e.g. Basketball, Coding, Hiking"
                    />
                  </>
                ) : interests.length ? (
                  <div className="profile-tags">
                    {interests.map((tag, idx) => (
                      <span key={idx} className="profile-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="profile-field-value empty">
                    No interests added yet
                  </span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-btn profile-btn--ghost"
                  onClick={cancelEditing}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-btn profile-btn--primary"
                  disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            )}

            {errorMsg && <p className="profile-error">{errorMsg}</p>}
          </div>
        </form>
      </div>

      {/*
        existingPublicId is passed so the modal knows whether to:
        - POST (no previous image) → fresh Cloudinary upload
        - PATCH (has previous image) → delete old + upload new in one step
      */}
      <ProfileImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onSuccess={handleImageUploadSuccess}
        existingPublicId={profileImagePublicId}
      />
    </div>
  );
}
