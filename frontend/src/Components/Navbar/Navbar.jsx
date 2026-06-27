import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useModal } from '../ModalContext.jsx';

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

  const closeMenu = () => setMenuOpen(false);

  const exploreLink = ({ isActive }) =>
    `relative no-underline font-semibold text-[0.9rem] tracking-[0.01em] py-1.5 transition-colors duration-200 after:content-[''] after:absolute after:bottom-[-2px] after:left-0 after:h-0.5 after:bg-[#7c3aed] after:transition-[width] after:duration-[250ms] ${
      isActive
        ? 'text-white after:w-full'
        : 'text-[rgba(255,255,255,0.78)] hover:text-white after:w-0 hover:after:w-full'
    }`;

  return (
    <nav
      className="fixed top-0 left-0 w-full h-[var(--nav-h)] z-[1000] bg-black border-b border-[rgba(255,255,255,0.08)] px-12 flex items-center justify-between box-border shadow-[0_1px_0_rgba(124,58,237,0.2)] max-md:px-5"
      ref={navRef}>
      {/* Logo */}
      <div className="flex-shrink-0">
        <NavLink to={page} end className="no-underline">
          <h2 className="m-0 font-[Consolas,monospace] text-[1.4rem] font-extrabold tracking-[2px] text-white uppercase">
            Findr<span className="text-[#7c3aed]">.</span>
          </h2>
        </NavLink>
      </div>

      {/* Center nav links — desktop only */}
      <div className="absolute left-1/2 -translate-x-1/2 flex gap-7 max-md:hidden">
        <NavLink to="/home" className={exploreLink}>Map</NavLink>
        <NavLink to="/events" className={exploreLink}>Events</NavLink>
        <NavLink to="/clubs" className={exploreLink}>Clubs</NavLink>
      </div>

      {/* Right side — desktop only */}
      <div className="flex items-center gap-3 h-[72px] max-md:hidden">
        {!isAuthenticated ? (
          <>
            <button
              className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.75)] px-4 py-1.5 rounded-md text-[0.85rem] font-semibold tracking-[0.04em] transition-all duration-200 hover:border-[rgba(255,255,255,0.6)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]"
              onClick={openSignIn}>
              Sign In
            </button>
            <button
              className="bg-[#7c3aed] border border-[#7c3aed] text-white px-4 py-1.5 rounded-md text-[0.85rem] font-bold tracking-[0.04em] transition-all duration-200 hover:bg-[#6d28d9] hover:border-[#6d28d9] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(124,58,237,0.4)]"
              onClick={openRegister}>
              Sign Up
            </button>
          </>
        ) : (
          <div className="flex items-center gap-3">
            {user?.isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `border border-[rgba(124,58,237,0.5)] text-[#a78bfa] px-3 py-1.5 rounded-md font-semibold text-[0.82rem] no-underline transition-all duration-200 hover:bg-[rgba(124,58,237,0.12)] hover:text-white ${isActive ? 'bg-[rgba(124,58,237,0.2)] text-white' : ''}`
                }>
                Admin
              </NavLink>
            )}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `text-[1.1rem] px-1.5 py-1 rounded-md flex items-center no-underline transition-colors duration-200 hover:text-[#a78bfa] hover:bg-[rgba(124,58,237,0.08)] ${isActive ? 'text-[#a78bfa]' : 'text-[rgba(255,255,255,0.5)]'}`
              }>
              ⚙
            </NavLink>
            <button
              onClick={logout}
              className="bg-transparent border border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.7)] px-3.5 py-1.5 rounded-md cursor-pointer text-[0.85rem] font-semibold transition-all duration-200 hover:border-[#7c3aed] hover:text-[#a78bfa] hover:bg-[rgba(124,58,237,0.1)]">
              Logout
            </button>
            <NavLink
              to="/profile"
              className="flex items-center no-underline"
              end>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-[38px] h-[38px] rounded-full border-2 border-[#7c3aed] object-cover transition-[border-color] duration-200 hover:border-[#a78bfa]"
                />
              ) : (
                <div className="w-[38px] h-[38px] rounded-full border-2 border-[#7c3aed] bg-gradient-to-br from-[#5b21b6] to-[#7c3aed] flex items-center justify-center text-[0.9rem] font-bold text-white flex-shrink-0 transition-[border-color] duration-200 hover:border-[#a78bfa]">
                  {(user?.name?.charAt(0) || '?').toUpperCase()}
                </div>
              )}
            </NavLink>
          </div>
        )}
      </div>

      {/* Hamburger — mobile only */}
      <button
        className="hidden max-md:flex flex-col justify-center items-center gap-[5px] p-0 bg-none border-none cursor-pointer w-10 h-10 rounded-lg flex-shrink-0 transition-colors duration-200 hover:bg-[rgba(255,255,255,0.07)]"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={menuOpen}
        aria-controls="navbar-mobile-menu">
        <span
          className={`block w-[22px] h-0.5 bg-white rounded-sm transition-transform duration-[250ms] ease-in-out ${menuOpen ? 'translate-y-[7px] rotate-45' : ''}`}
        />
        <span
          className={`block w-[22px] h-0.5 bg-white rounded-sm transition-[transform,opacity] duration-200 ${menuOpen ? 'opacity-0 scale-x-0' : ''}`}
        />
        <span
          className={`block w-[22px] h-0.5 bg-white rounded-sm transition-transform duration-[250ms] ease-in-out ${menuOpen ? '-translate-y-[7px] -rotate-45' : ''}`}
        />
      </button>

      {/* Mobile slide-down menu */}
      {menuOpen && (
        <div
          id="navbar-mobile-menu"
          className="fixed top-[var(--nav-h)] left-0 right-0 bg-[#080808] border-b border-[rgba(124,58,237,0.2)] px-5 pb-5 pt-3 flex flex-col gap-1 z-[999] shadow-[0_12px_40px_rgba(0,0,0,0.6)] animate-fade-in"
          role="navigation"
          aria-label="Mobile menu">
          {[
            { to: '/home', label: 'Map' },
            { to: '/events', label: 'Events' },
            { to: '/clubs', label: 'Clubs' },
          ].map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `block px-3 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] rounded-lg no-underline transition-colors duration-200 hover:text-white hover:bg-[rgba(255,255,255,0.05)] ${isActive ? 'text-[#a78bfa]' : 'text-[rgba(255,255,255,0.65)]'}`
              }
              onClick={closeMenu}>
              {label}
            </NavLink>
          ))}
          <div className="h-px bg-[rgba(255,255,255,0.08)] my-2" />
          {!isAuthenticated ? (
            <>
              <button
                className="block w-full px-4 py-3 rounded-[10px] text-[0.95rem] font-semibold text-center transition-all duration-200 mt-1 bg-transparent border border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.75)] hover:border-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
                onClick={() => { closeMenu(); openSignIn(); }}>
                Sign In
              </button>
              <button
                className="block w-full px-4 py-3 rounded-[10px] text-[0.95rem] font-semibold text-center transition-all duration-200 mt-1 bg-[#7c3aed] border-none text-white shadow-[0_4px_18px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9]"
                onClick={() => { closeMenu(); openRegister(); }}>
                Sign Up
              </button>
            </>
          ) : (
            <>
              {user?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `block px-3 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] rounded-lg no-underline transition-colors duration-200 hover:text-white hover:bg-[rgba(255,255,255,0.05)] ${isActive ? 'text-[#a78bfa]' : 'text-[rgba(255,255,255,0.65)]'}`
                  }
                  onClick={closeMenu}>
                  Admin
                </NavLink>
              )}
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  `block px-3 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] rounded-lg no-underline transition-colors duration-200 hover:text-white hover:bg-[rgba(255,255,255,0.05)] ${isActive ? 'text-[#a78bfa]' : 'text-[rgba(255,255,255,0.65)]'}`
                }
                onClick={closeMenu}>
                Profile
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `block px-3 py-3.5 text-[0.95rem] font-semibold tracking-[0.01em] rounded-lg no-underline transition-colors duration-200 hover:text-white hover:bg-[rgba(255,255,255,0.05)] ${isActive ? 'text-[#a78bfa]' : 'text-[rgba(255,255,255,0.65)]'}`
                }
                onClick={closeMenu}>
                Settings
              </NavLink>
              <button
                className="block w-full px-4 py-3 rounded-[10px] text-[0.95rem] font-semibold text-center transition-all duration-200 mt-1 bg-transparent border border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.75)] hover:border-[rgba(255,255,255,0.45)] hover:text-white hover:bg-[rgba(255,255,255,0.04)]"
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
