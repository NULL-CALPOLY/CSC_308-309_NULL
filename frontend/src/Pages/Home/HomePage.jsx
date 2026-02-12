import './HomePage.css';
import { useState } from 'react';
import MainMapComponent from '../../Components/MainMapComponent/MainMapComponent.jsx';
import EventColumn from '../../Components/EventColumn/EventColumn.jsx';
import CreateEventButton from '../../Components/CreateEventButton/CreateEventButton.jsx';
import CreateEventModal from '../../Components/CreateEventModal/CreateEventModal.jsx';
import Navbar from '../../Components/Navbar/Navbar.jsx';

export default function HomePage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="HomePage">
      <Navbar />
      <div className="Map">
        <MainMapComponent />
      </div>
      <div className="Event-Column">
        <EventColumn eventList />
      </div>

      <CreateEventButton onClick={() => setShowModal(true)} />
      <CreateEventModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
}
