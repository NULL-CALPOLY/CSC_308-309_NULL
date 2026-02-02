import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './index.css';
import NavbarLanding from '../../Components/NavbarLanding/NavbarLanding.jsx';
import community from '../../assets/community.svg';
import LEBRON from '../../assets/LEBRON.gif';
import { useAuth } from '../../Hooks/useAuth.js';

export default function LandingPage() {
  const { isAuthenticated, logout } = useAuth();

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
            {!isAuthenticated ? (
              <a href="/register" className="cta-button">
              Get Started!
              </a>
            ) :
            (
              <a href="/home" className="cta-button">
              Get Started!
              </a>
            )}
          </div>
        </section>

        <section className="feature-section connect-section">
          <div className="feature-content">
            <section className="features">
              <div className="feature">
                <h2>Connect with others</h2>
                <p>
                  Find and connect with people who share your interests and
                  passions.
                </p>
              </div>
              <div className="feature">
                <h2>Discover new activities</h2>
                <p>
                  Explore a wide range of activities and hobbies to try out.
                </p>
              </div>
              <div className="feature">
                <h2>Build lasting connections</h2>
                <p>
                  Form meaningful relationships and build a supportive network
                  of like-minded individuals.
                </p>
              </div>
            </section>
            {!isAuthenticated ? (
              <a href="/register" className="learn-more">
              Learn more
            </a>
            ) :
            (
              <a href="/home" className="cta-button">
              Learn more
              </a>
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
                  <a href="/register" className="learn-more">
                    Join now
                  </a>
                ) :
                (
                  <a href="/home" className="cta-button">
                  Learn more
                  </a>
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
                  <a href="/register" className="learn-more">
                    Explore
                  </a>
                ) :
                (
                  <a href="/home" className="cta-button">
                  Learn more
                  </a>
                )}
            </div>
            <div className="feature-image">
              <img src={LEBRON} alt="Discover" />
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
          </div>
        </div>
      </footer>
    </div>
  );
}
