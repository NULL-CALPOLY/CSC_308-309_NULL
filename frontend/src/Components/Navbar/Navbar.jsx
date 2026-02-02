// src/Components/Navbar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './Navbar.css';
import LEBRON from '../../assets/LEBRON.gif';

export default function Navbar() {
  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <NavLink to="/home" className={linkClass} end>
          <h2>Findr</h2>
        </NavLink>
      </div>

      <div className="navbar__profile">
        <img src={LEBRON} alt="Profile" className="navbar__profile-icon" />
      </div>
    </nav>
  );
}
