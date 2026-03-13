import { Link } from 'react-router-dom';
import './Landing.css';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import community from '../../assets/community.svg';
import LEBRON from '../../assets/LEBRON.mp4';
import { useAuth } from '../../Hooks/UseAuth';
import { useModal } from '../../Components/ModalContext.jsx';

export default function LandingPageMapForward() {
  const { isAuthenticated } = useAuth();
  const { openSignIn } = useModal();

  return (
    <div className="landing-page lp-map">
      <header>
        <Navbar page="/" />
      </header>

      <main>
        {/* ── Hero: headline left, map mockup right ── */}
        <section className="hero-section">
          <div className="hero-left">
            <h1 className="hero-title">Find what's<br />happening<br />near you.</h1>
            <p className="hero-subtitle">
              Join pickup games, hikes, chess matches, and more —
              all within walking distance.
            </p>
            {!isAuthenticated ? (
              <button className="cta-button" onClick={openSignIn}>Get Started</button>
            ) : (
              <Link to="/home" className="cta-button">Open the Map</Link>
            )}
          </div>

          <div className="hero-right map-mockup">
            <div className="map-frame">
              {/* Simulated map pins */}
              <div className="map-bg" />
              <div className="map-pin pin1">
                <div className="pin-dot" />
                <div className="pin-label">3v3 Basketball · Today</div>
              </div>
              <div className="map-pin pin2">
                <div className="pin-dot" />
                <div className="pin-label">Sunrise Hike · Sun</div>
              </div>
              <div className="map-pin pin3">
                <div className="pin-dot" />
                <div className="pin-label">Chess @ Café · Sat</div>
              </div>
              <div className="map-pin pin4">
                <div className="pin-dot" />
                <div className="pin-label">Volleyball · Tomorrow</div>
              </div>
              <div className="map-you">
                <div className="you-dot" />
                <span>You</span>
              </div>
            </div>
          </div>
        </section>

        <section className="feature-section connect-section">
          <div className="feature-content">
            <h2 className="connect-heading">Everything you need to get out there</h2>
            <section className="features">
              <div className="feature">
                <div className="feature-accent-bar" />
                <div className="feature-icon-wrap">📍</div>
                <h2>Browse Local Events</h2>
                <p>See what's happening in your area — pickup sports, study sessions, game nights, and more.</p>
              </div>
              <div className="feature">
                <div className="feature-accent-bar" />
                <div className="feature-icon-wrap">⚡</div>
                <h2>Join in One Tap</h2>
                <p>RSVP instantly and get all the details — location, time, and who's coming.</p>
              </div>
              <div className="feature">
                <div className="feature-accent-bar" />
                <div className="feature-icon-wrap">🎯</div>
                <h2>Host Your Own</h2>
                <p>Create an event in seconds and let people nearby find and join you.</p>
              </div>
            </section>
            {!isAuthenticated ? (
              <button className="general-link" onClick={openSignIn}>See what's happening near you →</button>
            ) : (
              <Link to="/home" className="general-link">See what's happening near you →</Link>
            )}
          </div>
        </section>

        <section className="feature-section community-section">
          <div className="feature-content image-layout">
            <div className="feature-image">
              <img src={community} alt="Community" />
            </div>
            <div className="feature-text">
              <h2>Be part of a community</h2>
              <p>Join groups and activities that interest you, and build lasting connections with people who live right around the corner.</p>
              {!isAuthenticated ? (
                <button className="general-link" onClick={openSignIn}>Join the Community</button>
              ) : (
                <Link to="/home" className="general-link">Join the Community</Link>
              )}
            </div>
          </div>
        </section>

        <section className="feature-section discover-section">
          <div className="feature-content image-layout">
            <div className="feature-text">
              <h2>Discover new interests</h2>
              <p>You don't need to know anyone. You don't need to be good at it. Just show up.</p>
              {!isAuthenticated ? (
                <button className="general-link" onClick={openSignIn}>Discover Now</button>
              ) : (
                <Link to="/home" className="general-link">Discover Now</Link>
              )}
            </div>
            <div className="feature-image">
              <video src={LEBRON} autoPlay muted loop playsInline />
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="newsletter-content">
            <h2>Get the latest updates</h2>
            <p>Sign up to receive top stories and tips from Findr.</p>
            <form className="newsletter-form">
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Findr. All rights reserved.</p>
          <div className="footer-links">
            <a href="/privacy">Privacy</a>
            <a href="/terms">Terms</a>
            <a href="/help">Help</a>
            <a href="/business">Business</a>
          </div>
        </div>
      </footer>
    </div>
  );
}