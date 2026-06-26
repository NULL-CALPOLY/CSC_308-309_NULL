import './HomePage.css';
import { useState, useRef, useEffect } from 'react';
import { useDocumentTitle } from '../../Hooks/UseDocumentTitle.js';
import MainMapComponent from '../../Components/MainMapComponent/MainMapComponent.jsx';
import EventColumn from '../../Components/EventColumn/EventColumn.jsx';
import CreateEventButton from '../../Components/CreateEventButton/CreateEventButton.jsx';
import CreateEventModal from '../../Components/CreateEventModal/CreateEventModal.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import HamburgerIcon from '../../assets/Hamburger.svg';
import ArrowIcon from '../../assets/Arrow.svg';
import { useAuth } from '../../Hooks/UseAuth.ts';
import { useModal } from '../../Components/ModalContext.jsx';

const MOBILE_BP = 768;

export default function HomePage() {
  useDocumentTitle('Map');
  const [showModal, setShowModal] = useState(false);
  const [colOpen, setColOpen] = useState(() => window.innerWidth > MOBILE_BP);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const refetchEvents = useRef(null);

  const handleSelectEvent = (id) => {
    setSelectedEventId(id);
    if (id && window.innerWidth <= MOBILE_BP) setColOpen(true);
  };

  const { user } = useAuth();
  const { openSignIn } = useModal();

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth <= MOBILE_BP) setColOpen(false);
    };
    window.addEventListener('resize', onResize);
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className={`HomePage${colOpen ? '' : ' col-closed'}`}>
      <header>
        <Navbar page="/" />
      </header>
      <div className="Map">
        <MainMapComponent
          selectedId={selectedEventId}
          onSelect={handleSelectEvent}
          userCoords={userCoords}
          onCoordsChange={setUserCoords}
        />
      </div>
      <div className="Event-Column">
        <button
          className="col-close-btn"
          onClick={() => setColOpen(false)}
          title="Close panel"
          aria-label="Close event panel">
          <img src={ArrowIcon} alt="" />
        </button>
        <EventColumn
          onRefetchReady={(fn) => (refetchEvents.current = fn)}
          selectedId={selectedEventId}
          onSelect={handleSelectEvent}
          userCoords={userCoords}
        />
      </div>

      <button
        className="col-open-btn"
        onClick={() => setColOpen(true)}
        title="Open event panel"
        aria-label="Open event panel">
        <img src={HamburgerIcon} alt="" />
        <span className="col-open-label">Events</span>
      </button>

      <div className="Create-Event-Button">
        <CreateEventButton
          onClick={user ? () => setShowModal(true) : openSignIn}
          label={user ? 'Create Event' : 'Sign In to create event'}
        />
      </div>
      <CreateEventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          refetchEvents.current?.();
        }}
      />
    </div>
  );
}
