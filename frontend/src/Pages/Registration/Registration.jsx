import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegistrationMap from '../../Components/RegistrationMapComponent/RegistrationMapComponent.jsx';
import './Registration.css';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import { useAuth } from '../../Hooks/useAuth.js';

export default function Registration() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [interests, setInterests] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(null); // silently set by map
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register, loading } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location) {
      return;
    }

    try {
      await register({
        name,
        phoneNumber,
        gender,
        dateOfBirth,
        city,
        email,
        password,
        location,
        interests: interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
      });
      navigate('/home');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="container">
      <Navbar />
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
                type="tel"
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
                id="dateOfBirth"
                autoComplete="dateOfBirth"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
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
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Enter your interests"
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

          {error && (
            <p style={{ marginTop: '0.75rem', color: '#ff6b6b' }}>{error}</p>
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
