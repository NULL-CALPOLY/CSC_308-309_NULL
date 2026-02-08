import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';
import NavbarLanding from '../../Components/NavbarLanding/NavbarLanding.jsx';
import community from '../../assets/community.svg';
import LEBRON from '../../assets/LEBRON.mp4';
import LEBRONposter from '../../assets/LEBRON.jpg';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <header>
        <NavbarLanding />
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">Findr</h1>
            <p className="hero-subtitle">
              Your go-to platform for connecting with others and discovering new
              interests
            </p>
            <a href="/register" className="cta-button">
              Get Started!
            </a>
          </div>
        </section>

        <section className="feature-section connect-section">
          <div className="feature-content">
            <section className="features">
              <div className="feature">
                <h2>Smart Matchmaking</h2>
                <p>
                  Get matched with people based on shared interests, availability, and location.
                </p>
              </div>
              <div className="feature">
                <h2>Event Creation & RSVP</h2>
                <p>
                  Create hangouts, study sessions, or group events and see who’s coming.
                </p>
              </div>
              <div className="feature">
                <h2>Safety & Verification</h2>
                <p>
                  You can definitely, totally trust us with your safety and data.
                </p>
              </div>
            </section>
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
              <a href="/register" className="learn-more">
                Join now
              </a>
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
              <a href="/register" className="learn-more">
                Explore
              </a>
            </div>
            <div className="feature-image">
              <video src={LEBRON} autoPlay muted loop playsInLine poster={LEBRONposter} />
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
            <a href="/business">"Business"</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
