import EventComponent from '../EventComponent/EventComponent.jsx';
import './EventColumn.css';

export default function EventColumn(props) {
  console.log('EventColumn received props.eventList:', props.eventList);

  if (!props.eventList || props.eventList.length === 0) {
    return (
      <div className="Event_Container">
        <div className="Search_Bar">
          <input placeholder="Search events…" />
        </div>
        <div className="Event_List">
          <p>No events available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="Event_Container">
      <div className="Search_Bar">
        <input placeholder="Search events…" />
      </div>
      <div className="Event_List">
        {props.eventList.map((event, index) => (
          <EventComponent
            key={index}
            eventName={event.name}
            eventTime={event.time?.start}
            eventAddress={event.location?.coordinates}
            description={event.description}
            attendees={event.attendees}
            host={event.host}
            interest={event.interests?.[0]}
          />
        ))}
      </div>
    </div>
  );
}
