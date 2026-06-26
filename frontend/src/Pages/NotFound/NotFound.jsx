import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="nf-page">
      <Navbar page="/" />
      <main className="nf-main">
        <div className="nf-content">
          <span className="nf-code" aria-hidden="true">404</span>
          <h1 className="nf-title">Page not found</h1>
          <p className="nf-desc">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="nf-actions">
            <Link to="/" className="nf-btn nf-btn--primary">Go home</Link>
            <Link to="/events" className="nf-btn nf-btn--ghost">Browse events</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
