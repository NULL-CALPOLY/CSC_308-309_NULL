// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Hooks/useAuth.ts';
import './Navbar.css';
import LEBRON from '../../assets/LEBRON.gif';

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <NavLink to="/" className={linkClass} end>
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
            
            <img src={LEBRON} alt="Profile" className="navbar__profile-icon" />
        </div>
        )}
      </div>
    </nav>
  );
}
