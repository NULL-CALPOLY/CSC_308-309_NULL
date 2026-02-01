// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './Pages/Home/HomePage.jsx';
import SignIn from './Pages/SignIn/SignIn.jsx';
import Registration from './Pages/Registration/Registration.jsx';
import LandingPage from './Pages/Landing/index.jsx';

const AboutPage = () => <div style={{ padding: 24 }}>About</div>;
const SearchPage = () => <div style={{ padding: 24 }}>Search</div>;

export default function App() {
  return (
    <div className="app">
      <main className="main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/register" element={<Registration />} />
          <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
        </Routes>
      </main>
    </div>
  );
}
