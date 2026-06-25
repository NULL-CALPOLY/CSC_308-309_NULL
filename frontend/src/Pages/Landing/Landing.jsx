import { Link } from 'react-router-dom';
import './Landing.css';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import community from '../../assets/community.svg';
import LEBRON from '../../assets/LEBRON.mp4';
import { useAuth } from '../../Hooks/UseAuth';
import { useModal } from '../../Components/ModalContext.jsx';
import LandingEventPreview from '../../Components/LandingEventPreview/LandingEventPreview.jsx';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { openSignIn, openRegister } = useModal();

  return (
    <div className="landing-page">
      <header>
        <Navbar page="/" />
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Findr</h1>
            <p className="hero-subtitle">
              Your go-to platform for connecting with others and discovering new
              interests
            </p>
            {!isAuthenticated ? (
              <button className="cta-button" onClick={openSignIn}>
                Get Started!
              </button>
            ) : (
              <Link to="/home" className="cta-button">
                Get Started!
              </Link>
            )}
          </div>
        </section>

        {/* Live, public taste of the product — real upcoming events. */}
        <LandingEventPreview />

        <section className="feature-section connect-section">
          <div className="feature-content">
            <section className="features">
              <div className="feature">
                <h2>Smart Matchmaking</h2>
                <p>
                  Get matched with people based on shared interests,
                  availability, and location.
                </p>
              </div>
              <div className="feature">
                <h2>Event Creation & RSVP</h2>
                <p>
                  Create hangouts, study sessions, or group events and see who’s
                  coming.
                </p>
              </div>
              <div className="feature">
                <h2>Safety & Verification</h2>
                <p>
                  Cal Poly students can verify with their school email, and you
                  control who sees your profile and events.
                </p>
              </div>
            </section>
            {!isAuthenticated ? (
              <button className="general-link" onClick={openSignIn}>
                Learn More
              </button>
            ) : (
              <Link to="/home" className="general-link">
                Learn More
              </Link>
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
              <p>
                Join groups and activities that interest you, and build lasting
                connections.
              </p>

              {!isAuthenticated ? (
                <button className="general-link" onClick={openSignIn}>
                  Join the Community
                </button>
              ) : (
                <Link to="/home" className="general-link">
                  Join the Community
                </Link>
              )}
            </div>
          </div>
        </section>

        <section className="feature-section discover-section">
          <div className="feature-content image-layout">
            <div className="feature-text">
              <h2>Discover new interests</h2>
              <p>
                Explore activities and hobbies you've never tried before, and
                expand your horizons.
              </p>
              {!isAuthenticated ? (
                <button className="general-link" onClick={openSignIn}>
                  Discover Now
                </button>
              ) : (
                <Link to="/home" className="general-link">
                  Discover Now
                </Link>
              )}
            </div>
            <div className="feature-image">
              <video src={LEBRON} autoPlay muted loop playsInline />
            </div>
          </div>
        </section>

        <section className="newsletter-section">
          <div className="newsletter-content">
            <h2>Ready to find your people?</h2>
            <p>
              Join Findr to RSVP, host your own events, and connect with your
              community.
            </p>
            {!isAuthenticated ? (
              <button className="cta-button" onClick={openRegister}>
                Create your account
              </button>
            ) : (
              <Link to="/events" className="cta-button">
                Explore events
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2026 Findr. All rights reserved.</p>
          <div className="footer-links">
            <Link to="/events">Events</Link>
            <Link to="/clubs">Clubs</Link>
            <a href="mailto:hello@findr.page">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
