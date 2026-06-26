import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import './Landing.css';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import community from '../../assets/community.svg';
import { useAuth } from '../../Hooks/UseAuth';
import { useModal } from '../../Components/ModalContext.jsx';
import LandingEventPreview from '../../Components/LandingEventPreview/LandingEventPreview.jsx';

/* ── Scroll-reveal hook ── */
function useFadeIn(threshold = 0.15) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-visible');
          observer.disconnect();
        }
      },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return ref;
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { openSignIn, openRegister } = useModal();

  const featuresRef = useFadeIn(0.1);
  const communityRef = useFadeIn(0.15);
  const discoverRef = useFadeIn(0.15);
  const ctaRef = useFadeIn(0.2);

  return (
    <div className="landing-page">
      <header>
        <Navbar page="/" />
      </header>

      <main>
        {/* ── Hero ── */}
        <section className="hero-section">
          {/* Animated grid background */}
          <div className="hero-grid" aria-hidden="true" />

          {/* Floating orbs */}
          <div className="orb orb-1" aria-hidden="true" />
          <div className="orb orb-2" aria-hidden="true" />
          <div className="orb orb-3" aria-hidden="true" />

          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="hero-dot" aria-hidden="true" />
              Cal Poly's social hub
            </div>

            <h1 className="hero-title">
              Find your<br />
              <span className="hero-title-accent">people.</span>
            </h1>

            <p className="hero-subtitle">
              Discover events, join clubs, and connect with students who share
              your interests — all in one place.
            </p>

            <div className="hero-actions">
              {!isAuthenticated ? (
                <>
                  <button className="cta-button" onClick={openRegister}>
                    Get started free
                  </button>
                  <button className="cta-ghost" onClick={openSignIn}>
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  <Link to="/home" className="cta-button">
                    Open Findr
                  </Link>
                  <Link to="/events" className="cta-ghost">
                    Browse events
                  </Link>
                </>
              )}
            </div>

            <div className="hero-stats">
              <div className="hero-stat">
                <span className="hero-stat-num">Events</span>
                <span className="hero-stat-label">happening now</span>
              </div>
              <div className="hero-stat-divider" aria-hidden="true" />
              <div className="hero-stat">
                <span className="hero-stat-num">Clubs</span>
                <span className="hero-stat-label">to explore</span>
              </div>
              <div className="hero-stat-divider" aria-hidden="true" />
              <div className="hero-stat">
                <span className="hero-stat-num">Free</span>
                <span className="hero-stat-label">always</span>
              </div>
            </div>
          </div>

          {/* Scroll hint */}
          <div className="scroll-hint" aria-hidden="true">
            <div className="scroll-hint-line" />
          </div>
        </section>

        {/* ── Live event preview ── */}
        <LandingEventPreview />

        {/* ── Feature cards ── */}
        <section className="feature-section connect-section">
          <div className="section-label fade-up" ref={featuresRef}>
            <span className="section-pill">Why Findr</span>
          </div>
          <h2 className="section-heading fade-up">
            Built for real connections
          </h2>
          <p className="section-sub fade-up">
            Everything you need to find your community on campus.
          </p>

          <div className="features-grid fade-up">
            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Smart Matchmaking</h3>
              <p>
                Get matched with people based on shared interests,
                availability, and location.
              </p>
            </div>

            <div className="feature-card feature-card--accent">
              <div className="feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                  <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
                </svg>
              </div>
              <h3>Event Creation &amp; RSVP</h3>
              <p>
                Create hangouts, study sessions, or group events and see who's
                coming — in seconds.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon" aria-hidden="true">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  <polyline points="9 12 11 14 15 10" />
                </svg>
              </div>
              <h3>Safety &amp; Verification</h3>
              <p>
                Cal Poly students verify with their school email. You control
                who sees your profile and events.
              </p>
            </div>
          </div>

          <div className="section-cta fade-up">
            {!isAuthenticated ? (
              <button className="general-link" onClick={openSignIn}>
                Learn more
              </button>
            ) : (
              <Link to="/home" className="general-link">
                Learn more
              </Link>
            )}
          </div>
        </section>

        {/* ── Community section ── */}
        <section className="feature-section community-section">
          <div className="split-layout fade-up" ref={communityRef}>
            <div className="split-image">
              <div className="split-image-glow" aria-hidden="true" />
              <img src={community} alt="Community illustration" />
            </div>
            <div className="split-text">
              <span className="section-pill">Community</span>
              <h2>Be part of something bigger</h2>
              <p>
                Join groups and activities that interest you. Findr surfaces
                events from clubs you follow so you never miss what matters.
              </p>
              <ul className="feature-list">
                <li>
                  <span className="fl-check" aria-hidden="true">✓</span>
                  Follow clubs to see their events first
                </li>
                <li>
                  <span className="fl-check" aria-hidden="true">✓</span>
                  RSVP with one tap
                </li>
                <li>
                  <span className="fl-check" aria-hidden="true">✓</span>
                  Build lasting connections on campus
                </li>
              </ul>
              {!isAuthenticated ? (
                <button className="general-link" onClick={openSignIn}>
                  Join the community
                </button>
              ) : (
                <Link to="/clubs" className="general-link">
                  Explore clubs
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Discover section ── */}
        <section className="feature-section discover-section">
          <div className="split-layout split-layout--reverse fade-up" ref={discoverRef}>
            <div className="split-text">
              <span className="section-pill">Discover</span>
              <h2>Expand your horizons</h2>
              <p>
                Explore activities and hobbies you've never tried before.
                Findr's interest engine finds events tailored to you.
              </p>
              <div className="interest-tags">
                {['Hiking', 'Music', 'Coding', 'Gaming', 'Art', 'Sports', 'Film', 'Food'].map((tag) => (
                  <span key={tag} className="interest-tag">{tag}</span>
                ))}
              </div>
              {!isAuthenticated ? (
                <button className="general-link" onClick={openSignIn}>
                  Discover now
                </button>
              ) : (
                <Link to="/events" className="general-link">
                  Discover now
                </Link>
              )}
            </div>

            <div className="discover-visual" aria-hidden="true">
              <div className="dv-card dv-card-1">
                <span className="dv-dot dv-dot--green" />
                <div className="dv-info">
                  <strong>Photography Walk</strong>
                  <small>Sat · 10am · Downtown SLO</small>
                </div>
                <span className="dv-tag">Art</span>
              </div>
              <div className="dv-card dv-card-2">
                <span className="dv-dot dv-dot--purple" />
                <div className="dv-info">
                  <strong>Hackathon Kickoff</strong>
                  <small>Fri · 6pm · Engineering</small>
                </div>
                <span className="dv-tag">Coding</span>
              </div>
              <div className="dv-card dv-card-3">
                <span className="dv-dot dv-dot--blue" />
                <div className="dv-info">
                  <strong>Open Mic Night</strong>
                  <small>Thu · 7pm · UU Plaza</small>
                </div>
                <span className="dv-tag">Music</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="cta-section">
          <div className="cta-section-inner fade-up" ref={ctaRef}>
            <div className="cta-glow" aria-hidden="true" />
            <span className="section-pill">Get started</span>
            <h2>Ready to find your people?</h2>
            <p>
              Join Findr to RSVP, host your own events, and connect with your
              campus community — completely free.
            </p>
            {!isAuthenticated ? (
              <button className="cta-button cta-button--large" onClick={openRegister}>
                Create your account
              </button>
            ) : (
              <Link to="/events" className="cta-button cta-button--large">
                Explore events
              </Link>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="footer-logo">Findr</span>
            <p>&copy; 2026 Findr. All rights reserved.</p>
          </div>
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
