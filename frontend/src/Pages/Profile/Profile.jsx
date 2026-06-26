import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import Navbar from '../../Components/Navbar/Navbar';
import ProfileImageUploadModal from '../../Components/Modals/ProfileImageUploadModal/ProfileImageUploadModal';
import DeleteAccountModal from '../../Components/DeleteAccountModal/DeleteAccountModal';
import { useNavigate } from 'react-router-dom';
import EventComponent from '../../Components/EventComponent/EventComponent';
import VerifiedBadge from '../../Components/VerifiedBadge/VerifiedBadge';
import { useModal } from '../../Components/ModalContext.jsx';

const fieldInputCls =
  'w-full box-border bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-[8px] py-[0.6rem] px-[0.85rem] text-[0.85rem] font-[family-name:var(--font-mono,monospace)] text-white outline-none transition-[border-color,box-shadow,background] duration-200 placeholder:text-[rgba(255,255,255,0.16)] focus:border-[#7c3aed] focus:bg-[rgba(124,58,237,0.07)] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.14)]';

const selectCls =
  fieldInputCls +
  ' pr-8 appearance-none';

export default function Profile() {
  useDocumentTitle('Profile');
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
  const [avatarPublicId, setAvatarPublicId] = useState(null);
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
  const [isVerifiedStudent, setIsVerifiedStudent] = useState(false);

  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    updateProfileImage,
    updateProfileName,
  } = useAuth();
  const { openSignIn } = useModal();

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
          `${import.meta.env.VITE_API_BASE_URL}/users/me`,
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
        setAvatarPublicId(u.avatarPublicId || null);
        setBio(u.bio || '');
        setIsVerifiedStudent(!!u.isVerifiedStudent);
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
        if (res.ok && json.success) setAttendingEvents(json.data);
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
        if (res.ok && json.success) setHostedEvents(json.data);
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
      updateProfileImage(result.imageUrl);
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
          body: JSON.stringify({ name, phoneNumber, dateOfBirth, gender, city, email, bio, interests }),
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
      await logout();
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

  const renderEventCard = (event) => (
    <EventComponent
      key={event._id}
      eventId={event._id}
      eventName={event.name}
      eventDate={event.time?.start ? new Date(event.time.start).toLocaleDateString() : ''}
      eventTime={
        event.time?.start
          ? new Date(event.time.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
          : ''
      }
      eventAddress={event.address}
      description={event.description}
      interest={Array.isArray(event.interests) ? event.interests.join(', ') : ''}
      attendees={event.attendees}
      host={event.host}
    />
  );

  if (authLoading || loading)
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center text-[rgba(255,255,255,0.25)] text-[0.85rem] tracking-[0.1em]">
        Loading…
      </div>
    );

  if (errorMsg && !name)
    return (
      <div className="profile-page min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
        <Navbar page="/" />
        <div className="relative z-[1] min-h-[60vh] flex flex-col items-center justify-center gap-5 text-[rgba(255,255,255,0.75)] text-base px-8 text-center">
          <p>You need to be signed in to view your profile.</p>
          <button
            className="bg-[#7c3aed] border-none text-white font-bold py-[0.7rem] px-7 rounded-[8px] text-[0.95rem] cursor-pointer transition-[background] duration-200 hover:bg-[#6d28d9]"
            onClick={openSignIn}>
            Sign In
          </button>
        </div>
      </div>
    );

  return (
    <div className="profile-page min-h-screen bg-[#080808] pt-[var(--nav-h,72px)] text-white">
      <Navbar page="/" />

      {/* Back button */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-8 pt-6 max-[480px]:px-3 max-[480px]:pt-4">
        <button
          className="bg-none border-none text-[rgba(255,255,255,0.45)] text-[0.875rem] cursor-pointer p-0 tracking-[0.03em] transition-colors duration-200 hover:text-[#a78bfa]"
          onClick={() => navigate(-1)}>
          ← Back
        </button>
      </div>

      {/* Layout grid */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-8 pt-12 pb-20 grid grid-cols-[260px_1fr] gap-8 items-start max-[720px]:grid-cols-1 max-[720px]:px-4 max-[720px]:pt-6 max-[720px]:pb-16 max-[480px]:px-3 max-[480px]:pt-4 max-[480px]:pb-12 max-[480px]:gap-5">

        {/* Sidebar */}
        <aside className="sticky top-[calc(var(--nav-h,72px)+2rem)] flex flex-col gap-4 [animation:slide-up_0.5s_cubic-bezier(0.16,1,0.3,1)_both] max-[720px]:static">
          <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-[20px] px-6 py-8 flex flex-col items-center gap-4 backdrop-blur-[12px] max-[480px]:px-4 max-[480px]:py-6">

            {/* Avatar button */}
            <button
              type="button"
              className="profile-avatar-btn relative bg-none border-none p-[4px] cursor-pointer rounded-full w-[110px] h-[110px] flex-shrink-0 overflow-hidden"
              onClick={() => setShowImageUpload(true)}
              title="Change photo">
              <div className="profile-avatar-ring" />
              {/* Inner circle */}
              <div className="absolute inset-[7px] rounded-full overflow-hidden z-[1]">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover object-center block rounded-full relative z-[1]" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#1a0533] to-[#2e1065] flex items-center justify-center text-[2.6rem] font-bold text-[#a78bfa] border-2 border-[rgba(124,58,237,0.25)] relative z-[1]">
                    {(name?.charAt(0) || '?').toUpperCase()}
                  </div>
                )}
              </div>
              {/* Overlay */}
              <div className="profile-avatar-overlay">
                <span className="text-[1.1rem]">✎</span>
                <span className="text-[0.58rem] uppercase tracking-[0.1em] opacity-80">Edit</span>
              </div>
            </button>

            <p className="text-[1.3rem] font-bold text-white m-0 text-center leading-[1.2]">{name || '—'}</p>
            {isVerifiedStudent && (
              <div className="flex justify-center mt-[0.1rem] mb-[0.4rem]">
                <VerifiedBadge size="sm" />
              </div>
            )}
            <p className="text-[0.7rem] text-[rgba(255,255,255,0.3)] m-0 text-center break-all">{email}</p>

            {(interests.length > 0 || city) && (
              <div className="flex gap-2 flex-wrap justify-center">
                {interests.length > 0 && (
                  <span className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] rounded-full py-[0.22rem] px-[0.7rem] text-[0.68rem] text-[#a78bfa]">
                    {interests.length} interest{interests.length !== 1 ? 's' : ''}
                  </span>
                )}
                {city && (
                  <span className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.25)] rounded-full py-[0.22rem] px-[0.7rem] text-[0.68rem] text-[#a78bfa]">
                    {city}
                  </span>
                )}
              </div>
            )}

            {!isEditing && (
              <div className="w-full flex flex-col gap-2">
                <button
                  className="w-full py-[0.7rem] rounded-[10px] border-none bg-[#7c3aed] text-white text-[0.75rem] font-medium tracking-[0.08em] uppercase cursor-pointer transition-all duration-200 hover:bg-[#6d28d9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-px"
                  onClick={startEditing}>
                  Edit Profile
                </button>
                <button
                  className="w-full py-[0.7rem] rounded-[10px] bg-transparent border border-[rgba(239,68,68,0.25)] text-[rgba(239,68,68,0.55)] text-[0.72rem] font-medium tracking-[0.08em] uppercase cursor-pointer transition-all duration-200 hover:bg-[rgba(239,68,68,0.07)] hover:border-[rgba(239,68,68,0.5)] hover:text-[#f87171] hover:shadow-[0_4px_16px_rgba(239,68,68,0.15)]"
                  onClick={() => setShowDeleteModal(true)}>
                  Delete Account
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main form */}
        <form
          className="flex flex-col gap-5 [animation:slide-up_0.5s_0.1s_cubic-bezier(0.16,1,0.3,1)_both]"
          onSubmit={handleSubmit}
          noValidate>

          {/* Personal Information */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden backdrop-blur-[8px] transition-[border-color] duration-[250ms] focus-within:border-[rgba(124,58,237,0.3)]">
            <div className="flex items-center gap-[0.65rem] px-6 py-[0.9rem] border-b border-[rgba(255,255,255,0.05)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.7)] flex-shrink-0" />
              <h3 className="m-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[rgba(255,255,255,0.35)]">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1 max-[720px]:flex max-[720px]:flex-col">
              {/* Full Name */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Full Name</label>
                {isEditing ? (
                  <input className={fieldInputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" required />
                ) : (
                  <span className={`text-[0.88rem] py-[0.45rem] border-b border-[rgba(255,255,255,0.05)] min-h-[2rem] ${name ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.18)] italic'}`}>
                    {name || 'Not set'}
                  </span>
                )}
              </div>
              {/* Email */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Email</label>
                {isEditing ? (
                  <input className={fieldInputCls} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
                ) : (
                  <span className={`text-[0.88rem] py-[0.45rem] border-b border-[rgba(255,255,255,0.05)] min-h-[2rem] ${email ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.18)] italic'}`}>
                    {email || 'Not set'}
                  </span>
                )}
              </div>
              {/* Gender */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Gender</label>
                {isEditing ? (
                  <select
                    className={selectCls}
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='rgba(255,255,255,0.35)' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                    }}>
                    <option value="" style={{ background: '#1a1a1a' }}>Select</option>
                    <option value="Male" style={{ background: '#1a1a1a' }}>Male</option>
                    <option value="Female" style={{ background: '#1a1a1a' }}>Female</option>
                    <option value="Non-binary" style={{ background: '#1a1a1a' }}>Non-binary</option>
                    <option value="Other" style={{ background: '#1a1a1a' }}>Other</option>
                    <option value="Prefer not to say" style={{ background: '#1a1a1a' }}>Prefer not to say</option>
                  </select>
                ) : (
                  <span className={`text-[0.88rem] py-[0.45rem] border-b border-[rgba(255,255,255,0.05)] min-h-[2rem] ${gender ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.18)] italic'}`}>
                    {gender || 'Not set'}
                  </span>
                )}
              </div>
              {/* Date of Birth */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Date of Birth</label>
                {isEditing ? (
                  <input
                    className={`${fieldInputCls} [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:[filter:invert(0.6)]`}
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                ) : (
                  <span className={`text-[0.88rem] py-[0.45rem] border-b border-[rgba(255,255,255,0.05)] min-h-[2rem] ${dateOfBirth ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.18)] italic'}`}>
                    {dateOfBirth?.split('T')[0] || 'Not set'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* About / Bio */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden backdrop-blur-[8px] transition-[border-color] duration-[250ms] focus-within:border-[rgba(124,58,237,0.3)]">
            <div className="flex items-center gap-[0.65rem] px-6 py-[0.9rem] border-b border-[rgba(255,255,255,0.05)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.7)] flex-shrink-0" />
              <h3 className="m-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[rgba(255,255,255,0.35)]">About</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-[0.4rem]">
                {isEditing ? (
                  <>
                    <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Bio</label>
                    <textarea
                      className={`${fieldInputCls} resize-y min-h-[90px]`}
                      value={bio}
                      onChange={(e) => setBio(e.target.value.slice(0, 500))}
                      placeholder="Tell people a bit about yourself…"
                      rows={4}
                      maxLength={500}
                    />
                    <span className="block text-right text-[0.75rem] text-[#8a93a2] mt-1">{bio.length}/500</span>
                  </>
                ) : bio ? (
                  <p className="m-0 whitespace-pre-wrap leading-[1.5] text-[rgba(255,255,255,0.8)] text-[0.88rem]">{bio}</p>
                ) : (
                  <span className="text-[rgba(255,255,255,0.18)] italic text-[0.88rem]">No bio yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden backdrop-blur-[8px] transition-[border-color] duration-[250ms] focus-within:border-[rgba(124,58,237,0.3)]">
            <div className="flex items-center gap-[0.65rem] px-6 py-[0.9rem] border-b border-[rgba(255,255,255,0.05)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.7)] flex-shrink-0" />
              <h3 className="m-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[rgba(255,255,255,0.35)]">Contact &amp; Location</h3>
            </div>
            <div className="p-6 grid grid-cols-2 gap-5 max-[720px]:grid-cols-1 max-[720px]:flex max-[720px]:flex-col">
              {/* Phone */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Phone</label>
                {isEditing ? (
                  <input
                    className={fieldInputCls}
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Phone number"
                  />
                ) : (
                  <span className={`text-[0.88rem] py-[0.45rem] border-b border-[rgba(255,255,255,0.05)] min-h-[2rem] ${phoneNumber ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.18)] italic'}`}>
                    {phoneNumber || 'Not set'}
                  </span>
                )}
              </div>
              {/* City */}
              <div className="flex flex-col gap-[0.4rem]">
                <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">City</label>
                {isEditing ? (
                  <input
                    className={fieldInputCls}
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Your city"
                  />
                ) : (
                  <span className={`text-[0.88rem] py-[0.45rem] border-b border-[rgba(255,255,255,0.05)] min-h-[2rem] ${city ? 'text-[rgba(255,255,255,0.8)]' : 'text-[rgba(255,255,255,0.18)] italic'}`}>
                    {city || 'Not set'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden backdrop-blur-[8px] transition-[border-color] duration-[250ms] focus-within:border-[rgba(124,58,237,0.3)]">
            <div className="flex items-center gap-[0.65rem] px-6 py-[0.9rem] border-b border-[rgba(255,255,255,0.05)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.7)] flex-shrink-0" />
              <h3 className="m-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[rgba(255,255,255,0.35)]">Interests</h3>
            </div>
            <div className="p-6">
              <div className="flex flex-col gap-[0.4rem]">
                {isEditing ? (
                  <>
                    <label className="text-[0.62rem] uppercase tracking-[0.1em] text-[rgba(255,255,255,0.28)]">Comma-separated</label>
                    <input
                      className={fieldInputCls}
                      type="text"
                      value={interestInput}
                      onChange={handleInterestInput}
                      placeholder="e.g. Basketball, Coding, Hiking"
                    />
                  </>
                ) : interests.length ? (
                  <div className="flex flex-wrap gap-[6px] py-[0.35rem]">
                    {interests.map((tag, idx) => (
                      <span
                        key={idx}
                        className="bg-[rgba(124,58,237,0.1)] border border-[rgba(124,58,237,0.28)] text-[#a78bfa] text-[0.7rem] py-[0.25rem] px-[0.72rem] rounded-full tracking-[0.03em] transition-[background,border-color] duration-150 hover:bg-[rgba(124,58,237,0.18)] hover:border-[rgba(124,58,237,0.45)]">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-[rgba(255,255,255,0.18)] italic text-[0.88rem]">No interests added yet</span>
                )}
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-[rgba(255,255,255,0.05)] bg-[rgba(0,0,0,0.15)] flex-wrap">
                <button
                  type="button"
                  className="py-[0.6rem] px-[1.4rem] rounded-[8px] text-[0.72rem] font-medium tracking-[0.07em] uppercase cursor-pointer border border-[rgba(255,255,255,0.1)] bg-transparent text-[rgba(255,255,255,0.45)] transition-all duration-200 hover:border-[rgba(255,255,255,0.3)] hover:text-white"
                  onClick={cancelEditing}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-[0.6rem] px-[1.4rem] rounded-[8px] text-[0.72rem] font-medium tracking-[0.07em] uppercase cursor-pointer border-none bg-[#7c3aed] text-white transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:not-disabled:bg-[#6d28d9] hover:not-disabled:-translate-y-px hover:not-disabled:shadow-[0_6px_20px_rgba(124,58,237,0.4)]"
                  disabled={saving}>
                  {saving ? 'Saving…' : 'Save Profile'}
                </button>
              </div>
            )}

            {errorMsg && (
              <p className="text-[#f87171] text-[0.72rem] px-6 pb-4 text-right m-0" role="alert">
                {errorMsg}
              </p>
            )}
          </div>

          {/* Events Attending */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden backdrop-blur-[8px]">
            <div className="flex items-center gap-[0.65rem] px-6 py-[0.9rem] border-b border-[rgba(255,255,255,0.05)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.7)] flex-shrink-0" />
              <h3 className="m-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[rgba(255,255,255,0.35)]">Events I'm Attending</h3>
            </div>
            <div className="p-5">
              {attendingEvents.length ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 max-[720px]:grid-cols-1">
                  {attendingEvents.map(renderEventCard)}
                </div>
              ) : (
                <div className="border border-dashed border-[rgba(167,139,250,0.18)] rounded-[14px] bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(124,58,237,0.04)] py-5 px-4 text-center">
                  <span className="text-[rgba(255,255,255,0.18)] italic text-[0.88rem]">Not attending any events yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Events Hosting */}
          <div className="bg-[rgba(255,255,255,0.025)] border border-[rgba(255,255,255,0.07)] rounded-[16px] overflow-hidden backdrop-blur-[8px]">
            <div className="flex items-center gap-[0.65rem] px-6 py-[0.9rem] border-b border-[rgba(255,255,255,0.05)]">
              <span className="w-[6px] h-[6px] rounded-full bg-[#7c3aed] shadow-[0_0_8px_rgba(124,58,237,0.7)] flex-shrink-0" />
              <h3 className="m-0 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-[rgba(255,255,255,0.35)]">Events I'm Hosting</h3>
            </div>
            <div className="p-5">
              {hostedEvents.length ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4 max-[720px]:grid-cols-1">
                  {hostedEvents.map(renderEventCard)}
                </div>
              ) : (
                <div className="border border-dashed border-[rgba(167,139,250,0.18)] rounded-[14px] bg-gradient-to-b from-[rgba(255,255,255,0.02)] to-[rgba(124,58,237,0.04)] py-5 px-4 text-center">
                  <span className="text-[rgba(255,255,255,0.18)] italic text-[0.88rem]">You haven't hosted any events yet</span>
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
