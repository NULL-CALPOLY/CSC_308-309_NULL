import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useModal } from '../ModalContext.jsx';
import './Navbar.css';

export default function Navbar({ page = '/' }) {
  const { isAuthenticated, logout, user } = useAuth();
  const { openSignIn, openRegister } = useModal();

  const linkClass = ({ isActive }) =>
    isActive ? 'navbar__link active' : 'navbar__link';

  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <NavLink to={page} className={linkClass} end>
          <h2>Findr</h2>
        </NavLink>
      </div>

      <div className="navbar__explore">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive ? 'navbar__explore-link active' : 'navbar__explore-link'
          }>
          Explore Events
        </NavLink>
      </div>

      <div className="navbar__links">
        {!isAuthenticated ? (
          <>
            <button className="navbar__link signin" onClick={openSignIn}>
              Sign In
            </button>
            <button className="navbar__link signup" onClick={openRegister}>
              Registration
            </button>
          </>
        ) : (
          <div className="navbar__profile">
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
    </nav>
  );
}
