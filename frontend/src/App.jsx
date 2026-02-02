// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './Pages/Home/HomePage.jsx';
import SignIn from './Pages/SignIn/SignIn.jsx';
import Registration from './Pages/Registration/Registration.jsx';
import { AuthProvider } from './Components/AuthProvider.jsx';
import Navbar from './Components/Navbar/Navbar.jsx';
import LandingPage from './Pages/Landing/index.jsx';
import ProtectedRoute from './Components/ProtectedComponent.jsx';

const AboutPage = () => <div style={{ padding: 24 }}>About</div>;
const SearchPage = () => <div style={{ padding: 24 }}>Search</div>;

export default function App() {
  return (
    <AuthProvider>
      <div className="app">
        <Navbar className="navbar" />
        <main className="main">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  {' '}
                  <HomePage />{' '}
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Registration />} />
            <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}
