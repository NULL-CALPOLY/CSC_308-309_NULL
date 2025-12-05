// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
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
        <NavLink to="/signin" className={linkClass}>
          Sign In
        </NavLink>
        <NavLink to="/register" className={linkClass}>
          Registration
        </NavLink>
      </div>

      <div className="navbar__profile">
        <img
          src="/profile-icon.svg"
          alt="Profile"
          className="navbar__profile-icon"
        />
      </div>
    </nav>
  );
}
