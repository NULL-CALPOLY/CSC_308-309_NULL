import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useModal } from '../ModalContext.jsx';
import './Navbar.css';

export default function Navbar({ page = '/' }) {
  const { isAuthenticated, logout, user } = useAuth();
  const { openSignIn, openRegister } = useModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler, { passive: true });
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [menuOpen]);

  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="navbar__logo">
        <NavLink to={page} className={linkClass} end>
          <h2>Findr<span>.</span></h2>
        </NavLink>
      </div>

      <div className="navbar__explore">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? 'navbar__explore-link active' : 'navbar__explore-link'
          }>
          Map
        </NavLink>
        <NavLink
          to="/events"
          className={({ isActive }) =>
            isActive ? 'navbar__explore-link active' : 'navbar__explore-link'
          }>
          Events
        </NavLink>
        <NavLink
          to="/clubs"
          className={({ isActive }) =>
            isActive ? 'navbar__explore-link active' : 'navbar__explore-link'
          }>
          Clubs
        </NavLink>
      </div>

      <div className="navbar__links">
        {!isAuthenticated ? (
          <>
            <button className="navbar__link signin" onClick={openSignIn}>
              Sign In
            </button>
            <button className="navbar__link signup" onClick={openRegister}>
              Sign Up
            </button>
          </>
        ) : (
          <div className="navbar__profile">
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive
                    ? 'navbar__link navbar__admin active'
                    : 'navbar__link navbar__admin'
                }>
                Admin
              </NavLink>
            )}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive
                  ? 'navbar__link navbar__settings active'
                  : 'navbar__link navbar__settings'
              }>
              ⚙
            </NavLink>
            <button onClick={logout} className="navbar__logout-btn">
              Logout
            </button>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive
                  ? 'navbar__profile-link active'
                  : 'navbar__profile-link'
              }
              end>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="navbar__profile-icon"
                />
              ) : (
                <div className="navbar__profile-initial">
                  {(user?.name?.charAt(0) || '?').toUpperCase()}
                </div>
              )}
            </NavLink>
          </div>
        )}
      </div>

      {/* Hamburger — mobile only */}
      <button
        className={`navbar__hamburger${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="navbar-mobile-menu">
        <span />
        <span />
        <span />
      </button>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div id="navbar-mobile-menu" className="navbar__mobile-menu" role="navigation" aria-label="Mobile menu">
          <NavLink
            to="/home"
            className={({ isActive }) => (isActive ? 'nmm-link active' : 'nmm-link')}
            onClick={closeMenu}>
            Map
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => (isActive ? 'nmm-link active' : 'nmm-link')}
            onClick={closeMenu}>
            Events
          </NavLink>
          <NavLink
            to="/clubs"
            className={({ isActive }) => (isActive ? 'nmm-link active' : 'nmm-link')}
            onClick={closeMenu}>
            Clubs
          </NavLink>
          <div className="nmm-divider" />
          {!isAuthenticated ? (
            <>
              <button
                className="nmm-btn nmm-btn--ghost"
                onClick={() => { closeMenu(); openSignIn(); }}>
                Sign In
              </button>
              <button
                className="nmm-btn nmm-btn--primary"
                onClick={() => { closeMenu(); openRegister(); }}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              {user?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) => (isActive ? 'nmm-link active' : 'nmm-link')}
                  onClick={closeMenu}>
                  Admin
                </NavLink>
              )}
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? 'nmm-link active' : 'nmm-link')}
                onClick={closeMenu}>
                Profile
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) => (isActive ? 'nmm-link active' : 'nmm-link')}
                onClick={closeMenu}>
                Settings
              </NavLink>
              <button
                className="nmm-btn nmm-btn--ghost"
                onClick={() => { closeMenu(); logout(); }}>
                Logout
              </button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
