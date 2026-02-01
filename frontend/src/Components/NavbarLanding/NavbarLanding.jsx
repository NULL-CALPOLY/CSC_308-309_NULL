// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './NavbarLanding.css';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar__logo">
          <NavLink to="/" className={linkClass} end>
            <h2>Findr</h2>
          </NavLink>
        </div>
        <div className="navbar__links">
          <NavLink to="/about" className={linkClass}>
            About
          </NavLink>
          <NavLink to="/search" className={linkClass}>
            Search
          </NavLink>
          <NavLink to="/signin" className={linkClass}>
            Sign In
          </NavLink>
          <NavLink to="/register" className={linkClass} end>
            Register
          </NavLink>
        </div>
      </div>
    </nav>
  );
}
