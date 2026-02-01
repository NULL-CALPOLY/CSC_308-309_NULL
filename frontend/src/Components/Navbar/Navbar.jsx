// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth.ts';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <h2>Findr</h2>
      </div>

      <div className="navbar__links">
        <NavLink to="/" className={linkClass} end>
          Home
        </NavLink>
        <NavLink to="/about" className={linkClass}>
          About
        </NavLink>
        <NavLink to="/search" className={linkClass}>
          Search
        </NavLink>
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
          <button onClick={logout} className="navbar__logout-btn">
            Logout
          </button>
        )}
      </div>

      {isAuthenticated && (
        <div className="navbar__profile">
          <img
            src="/profile-icon.svg"
            alt="Profile"
            className="navbar__profile-icon"
          />
        </div>
      )}
    </nav>
  );
}
