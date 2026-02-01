import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationMap from '../../Components/RegistrationMapComponent/RegistrationMapComponent';
import './Registration.css';

export default function Registration() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [DOB, setDOB] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState([]);
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(null); // silently set by map
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (!location || !location.latitude || !location.longitude) {
      setErrorMsg('Please select a location on the map.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phoneNumber,
          gender,
          DOB,
          city,
          email,
          location,
          interests,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));

        // 👇 duplicate email detection
        if (res.status === 409) {
          throw new Error('This email is already in use.');
        }

        throw new Error(err.message || 'Registration failed');
      }

      await res.json();

      // Only create login if user was created
      const loginRes = await fetch('http://localhost:3000/logins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        const err = await loginRes.json().catch(() => ({}));
        console.warn('Login registration failed:', err.message);
      }

      // ✅ SUCCESS ONLY
      navigate('/');
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="registration-container">
        <form onSubmit={handleSubmit} className="registration-form">
          <h2>Register</h2>
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="name">Name:</label>
              <input
                type="name"
                id="name"
                autoComplete="username"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="phoneNumber">Phone Number:</label>
              <input
                type="phoneNumber"
                id="phoneNumber"
                autoComplete="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="Enter your phone number"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="dateOfBirth">Date Of Birth:</label>
              <input
                type="date"
                id="DOB"
                autoComplete="DOB"
                value={DOB}
                onChange={(e) => setDOB(e.target.value)}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="gender">Gender:</label>

              <div className="select-wrapper">
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required>
                  <option value="">Select your gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Non-binary">Non-binary</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="city">City:</label>
              <input
                type="text"
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter your city"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="interests">Interests:</label>
              <input
                type="text"
                id="interests"
                value={interests.join(', ')}
                onChange={(e) =>
                  setInterests(e.target.value.split(',').map((i) => i.trim()))
                }
                placeholder="Enter your interests"
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-field">
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
            </div>
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>

          {errorMsg && (
            <p style={{ marginTop: '0.75rem', color: '#ff6b6b' }}>{errorMsg}</p>
          )}
        </form>
        <div className="map-column">
          <RegistrationMap
            onLocationSelect={(lat, lng) =>
              setLocation({ latitude: lat, longitude: lng })
            }
          />
        </div>
      </div>
    </div>
  );
}
