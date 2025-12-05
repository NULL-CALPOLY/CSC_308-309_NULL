import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';

export default function EventColumn(props) {
  return (
    <div className="Event_Container">
      <div className="Search_Bar">
        <input placeholder="Search events…" />
      </div>
      <div className="Event_List">
        {props.eventList.map((event, index) => (
          <EventComponent
            key={index}
            eventName={event.eventName}
            eventTime={event.eventTime}
            eventAddress={event.eventAddress}
            description={event.description}
            attendees={event.attendees}
            host={event.Host}
            interest={event.Interest}
          />
        ))}
      </div>
    </div>
  );
}
