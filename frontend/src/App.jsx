// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import Navbar from './Components/Navbar.jsx';
import HomePage from './Pages/HomePage.jsx';
import SignIn from './Pages/SignIn.jsx';

const AboutPage = () => <div style={{ padding: 24 }}>About</div>;
const SearchPage = () => <div style={{ padding: 24 }}>Search</div>;

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
      </Routes>
    </>
  );
}
