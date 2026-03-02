// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import HomePage from './Pages/Home/HomePage.jsx';
import SignInModal from './Components/Modals/SignInModal/SignInModal.jsx';
import RegistrationModal from './Components/Modals/RegistrationModal/RegistrationModal.jsx';
import { AuthProvider } from './Components/AuthProvider.jsx';
import { ModalProvider, useModal } from './Components/ModalContext.jsx';
import LandingPage from './Pages/Landing/Landing.jsx';
import Profile from './Pages/Profile/Profile.jsx';
import ProtectedRoute from './Components/ProtectedComponent.jsx';
import EventDetails from './Pages/EventDetails/EventDetails.jsx';
import './App.css';

const AboutPage = () => <div style={{ padding: 24 }}>About</div>;
const SearchPage = () => <div style={{ padding: 24 }}>Search</div>;

export default function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <AppContent />
      </ModalProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { showSignIn, showRegister, openSignIn, openRegister, closeAll } = useModal();
  return (
    <div className="app">
      <main className="main">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                {' '}
                <Profile />{' '}
              </ProtectedRoute>
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/events/:id" element={
            <ProtectedRoute>
              {' '}
              <EventDetails />{' '}
            </ProtectedRoute>} />
          <Route path="*" element={<div style={{ padding: 24 }}>404</div>} />
        </Routes>
        <SignInModal
          isOpen={showSignIn}
          onClose={closeAll}
          onSwitchToRegister={openRegister}
        />
        <RegistrationModal
          isOpen={showRegister}
          onClose={closeAll}
          onSwitchToSignIn={openSignIn}
        />
      </main>
    </div>
  );
}
