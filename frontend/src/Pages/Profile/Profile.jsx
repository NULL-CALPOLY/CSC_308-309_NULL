import React, { useState, useEffect } from 'react';
import './Profile.css';
import { useAuth } from '../../Hooks/UseAuth.ts';
import Navbar from '../../Components/Navbar/Navbar';
import ProfileImageUploadModal from '../../Components/Modals/ProfileImageUploadModal/ProfileImageUploadModal';
import DeleteAccountModal from '../../Components/DeleteAccountModal/DeleteAccountModal';
import { useNavigate } from 'react-router-dom';
import EventComponent from '../../Components/EventComponent/EventComponent';

export default function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [interestInput, setInterestInput] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [avatarPublicId, setAvatarPublicId] = useState(null); // Cloudinary publicId
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [attendingEvents, setAttendingEvents] = useState([]);
  const [hostedEvents, setHostedEvents] = useState([]);
  const [bio, setBio] = useState('');

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
        setAvatar(u.avatar || null);
        setAvatarPublicId(u.avatarPublicId || null); // load existing publicId
        setBio(u.bio || '');
        setInterests(Array.isArray(u.interests) ? u.interests : []);
      } catch (err) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchAttendingEvents = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/events/search/attendee/${user.id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const json = await res.json();
        if (res.ok && json.success) {
          setAttendingEvents(json.data);
        }
      } catch {
        setAttendingEvents([]);
      }
    };

    const fetchHostedEvents = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/events/search/host/${user.id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );
        const json = await res.json();
        if (res.ok && json.success) {
          setHostedEvents(json.data);
        }
      } catch {
        setHostedEvents([]);
      }
    };

    fetchUser();
    fetchAttendingEvents();
    fetchHostedEvents();
  }, [user, isAuthenticated, authLoading]);

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
            avatar: result.imageUrl,
            avatarPublicId: result.publicId,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to save image');

      setAvatar(result.imageUrl);
      setAvatarPublicId(result.publicId);
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
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            name,
            phoneNumber,
            dateOfBirth,
            gender,
            city,
            email,
            bio,
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
      setBio(u.bio || '');
      setInterests(Array.isArray(u.interests) ? u.interests : []);
      setIsEditing(false);
      updateProfileName(u.name);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/${user.id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.message || 'Failed to delete account');

      // Clear auth state and redirect to home / login
      // (call your logout helper if you have one, e.g. logout())
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
      setShowDeleteModal(false);
    } finally {
      setDeleting(false);
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

  // Shared renderer for the attending / hosting event lists.
  const renderEventCard = (event) => (
    <EventComponent
      key={event._id}
      eventId={event._id}
      eventName={event.name}
      eventDate={
        event.time?.start ? new Date(event.time.start).toLocaleDateString() : ''
      }
      eventTime={
        event.time?.start
          ? new Date(event.time.start).toLocaleTimeString([], {
              hour: 'numeric',
              minute: '2-digit',
            })
          : ''
      }
      eventAddress={event.address}
      description={event.description}
      interest={
        Array.isArray(event.interests) ? event.interests.join(', ') : ''
      }
      attendees={event.attendees}
      host={event.host}
    />
  );

  if (authLoading || loading)
    return <div className="profile-loading">Loading…</div>;
  if (errorMsg && !name)
    return <div className="profile-loading">{errorMsg}</div>;

  return (
    <div className="profile-page">
      <Navbar page="/" />

      <div className="profile-back-wrapper">
        <button className="profile-back" onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="profile-sidebar-card">
            <button
              type="button"
              className="profile-avatar-btn"
              onClick={() => setShowImageUpload(true)}
              title="Change photo">
              <div className="profile-avatar-ring" />
              <div className="profile-avatar-inner">
                {avatar ? (
                  <img
                    src={avatar}
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
              <div>
                <button className="profile-btn--sidebar" onClick={startEditing}>
                  Edit Profile
                </button>
                <button
                  className="profile-btn--delete-account"
                  onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </aside>

        <form className="profile-main" onSubmit={handleSubmit} noValidate>
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

          <div className="profile-panel">
            <div className="profile-panel-header">
              <span className="panel-dot" />
              <h3>About</h3>
            </div>
            <div className="profile-panel-body single">
              <div className="profile-field">
                {isEditing ? (
                  <>
                    <label>Bio</label>
                    <textarea
                      className="profile-bio-input"
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 500))}
                      placeholder="Tell people a bit about yourself…"
                      rows={4}
                      maxLength={500}
                    />
                    <span className="profile-bio-count">{bio.length}/500</span>
                  </>
                ) : bio ? (
                  <p className="profile-bio-text">{bio}</p>
                ) : (
                  <span className="profile-field-value empty">No bio yet</span>
                )}
              </div>
            </div>
          </div>

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

          <div className="profile-panel">
            <div className="profile-panel-header">
              <span className="panel-dot" />
              <h3>Events I'm Attending</h3>
            </div>
            <div className="profile-panel-body single profile-attending-body">
              {attendingEvents.length ? (
                <div className="profile-attending-list">
                  {attendingEvents.map(renderEventCard)}
                </div>
              ) : (
                <div className="profile-attending-empty">
                  <span className="profile-field-value empty">
                    Not attending any events yet
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="profile-panel">
            <div className="profile-panel-header">
              <span className="panel-dot" />
              <h3>Events I'm Hosting</h3>
            </div>
            <div className="profile-panel-body single profile-attending-body">
              {hostedEvents.length ? (
                <div className="profile-attending-list">
                  {hostedEvents.map(renderEventCard)}
                </div>
              ) : (
                <div className="profile-attending-empty">
                  <span className="profile-field-value empty">
                    You haven't hosted any events yet
                  </span>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>

      <ProfileImageUploadModal
        isOpen={showImageUpload}
        onClose={() => setShowImageUpload(false)}
        onSuccess={handleImageUploadSuccess}
        existingPublicId={avatarPublicId}
      />
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isDeleting={deleting}
      />
    </div>
  );
}
