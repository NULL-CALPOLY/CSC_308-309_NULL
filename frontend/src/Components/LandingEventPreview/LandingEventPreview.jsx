import { Link } from 'react-router-dom';
import { useUpcomingEvents } from '../../Hooks/UseEvents.jsx';
import EventComponent from '../EventComponent/EventComponent.jsx';
import './LandingEventPreview.css';

/**
 * Public "taste of the product" preview shown on the landing page. Surfaces the
 * soonest upcoming events from the public /events/upcoming feed so visitors can
 * see real activity before creating an account.
 */
export default function LandingEventPreview({ limit = 6 }) {
  const { events, loading, error } = useUpcomingEvents();

  const soonest = [...events]
    .sort((a, b) => new Date(a.eventStart) - new Date(b.eventStart))
    .slice(0, limit);

  return (
    <section className="lep-section" aria-labelledby="lep-heading">
      <div className="lep-header">
        <h2 id="lep-heading">Happening soon near Cal Poly</h2>
        <p>Real events on Findr right now — take a look before you sign up.</p>
      </div>

      {loading ? (
        <div className="lep-grid" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="lep-skeleton" />
          ))}
        </div>
      ) : error ? (
        <p className="lep-empty">
          Couldn’t load events right now — please check back soon.
        </p>
      ) : soonest.length === 0 ? (
        <p className="lep-empty">
          No upcoming events yet. Sign up and be the first to host one!
        </p>
      ) : (
        <div className="lep-grid">
          {soonest.map((event) => (
            <EventComponent
              key={event.id}
              eventId={event.id}
              eventName={event.eventName}
              eventDate={event.eventDate}
              eventTime={event.eventTime}
              eventAddress={event.eventAddress}
              description={event.description}
              attendees={event.attendees}
              host={event.host}
              interest={event.interests.join(', ')}
            />
          ))}
        </div>
      )}

      <div className="lep-cta">
        <Link to="/events" className="lep-explore-btn">
          Explore all events →
        </Link>
      </div>
    </section>
  );
}
