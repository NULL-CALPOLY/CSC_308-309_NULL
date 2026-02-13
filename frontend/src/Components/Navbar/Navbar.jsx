// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth.ts';
import './Navbar.css';
import LEBRON from '../../assets/LEBRON.mp4';

export default function Navbar({page = '/'}) {
  const { isAuthenticated, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  const profileClass = ({ isActive }) =>
    isActive ? 'navbar__profile-link active' : 'navbar__profile-link';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <NavLink to={page} className={linkClass} end>
          <h2>Findr</h2>
        </NavLink>
      </div>

      <div className="navbar__links">
        {!isAuthenticated ? (
          <>
            <NavLink to="/signin" className={linkClass}>
              Sign In
            </NavLink>
            <NavLink to="/register" className={linkClass} end>
              Registration
            </NavLink>
          </>
        ) : (
          <div className="navbar__profile">
            <button onClick={logout} className="navbar__logout-btn">
              Logout
            </button>

            <NavLink to="/profile" className={profileClass} end>
              <img
                src={LEBRON}
                alt="Profile"
                className="navbar__profile-icon"
              />
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  );
}
