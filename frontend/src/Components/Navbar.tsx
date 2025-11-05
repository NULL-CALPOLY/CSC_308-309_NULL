import React from "react";
import "./Navbar.css"; // create this file for styles

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <h2>Findr</h2>
      </div>

      <div className="navbar__links">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Search</a>
      </div>

      <div className="navbar__profile">
        <img
          src="/profile-icon.svg"
          alt="Profile"
          className="navbar__profile-icon"
        />
      </div>

      <div className="navbar__hamburger">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </nav>
  );
}
