import './HomePage.css';
import { useState, useRef } from 'react';
import MainMapComponent from '../../Components/MainMapComponent/MainMapComponent.jsx';
import EventColumn from '../../Components/EventColumn/EventColumn.jsx';
import CreateEventButton from '../../Components/CreateEventButton/CreateEventButton.jsx';
import CreateEventModal from '../../Components/CreateEventModal/CreateEventModal.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);
  const refetchEvents = useRef(null); 

  return (
    <div className="HomePage">
      <header>
        <Navbar page="/" />
      </header>
      <div className="Map">
        <MainMapComponent />
      </div>
      <div className="Event-Column">
        <EventColumn onRefetchReady={(fn) => (refetchEvents.current = fn)} />
      </div>
      <div className="Create-Event-Button">
        <CreateEventButton onClick={() => setShowModal(true)} />
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
