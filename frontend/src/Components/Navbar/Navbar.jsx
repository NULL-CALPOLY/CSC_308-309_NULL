// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import LEBRON from '../../assets/LEBRON.jpg';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

    const profileClass = ({ isActive }) =>
    isActive ? 'navbar__profile-link active' : 'navbar__profile-link';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <NavLink to="/home" className={linkClass} end>
          <h2>Findr</h2>
        </NavLink>
      </div>

      <div className="navbar__profile">
        <NavLink to="/profile" className={profileClass} end>
          <img src={LEBRON} alt="Profile" className="navbar__profile-icon" />
        </NavLink>
      </div>
    </nav>
  );
}
