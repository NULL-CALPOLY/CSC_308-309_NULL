import { Link } from 'react-router-dom';
import { useUpcomingEvents } from '../../Hooks/UseEvents.jsx';
import EventComponent from '../EventComponent/EventComponent.jsx';

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
    <section className="w-[min(1200px,92%)] mx-auto py-20 pb-12 max-[640px]:py-12 max-[640px]:pb-6" aria-labelledby="lep-heading">
      <div className="text-center mb-10">
        <h2
          id="lep-heading"
          className="text-[clamp(1.6rem,3vw,2.2rem)] font-semibold text-[#f8fafc] m-0 mb-2 tracking-[-0.02em]">
          Happening soon near Cal Poly
        </h2>
        <p className="text-[rgba(248,250,252,0.55)] text-base m-0">
          Real events on Findr right now — take a look before you sign up.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 items-start max-[640px]:grid-cols-1" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-[230px] rounded-2xl animate-shimmer"
              style={{
                background: 'linear-gradient(100deg, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 70%)',
                backgroundSize: '200% 100%',
              }}
            />
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-[rgba(248,250,252,0.4)] py-8 text-[0.95rem]">
          Couldn't load events right now — please check back soon.
        </p>
      ) : soonest.length === 0 ? (
        <p className="text-center text-[rgba(248,250,252,0.4)] py-8 text-[0.95rem]">
          No upcoming events yet. Sign up and be the first to host one!
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-5 items-start max-[640px]:grid-cols-1">
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

      <div className="flex justify-center mt-12">
        <Link
          to="/events"
          className="inline-block py-[0.85rem] px-7 rounded-full bg-[#7c3aed] text-white font-semibold text-base no-underline transition-[transform,background,box-shadow] duration-150 shadow-[0_0_20px_rgba(124,58,237,0.35)] hover:bg-[#6d28d9] hover:-translate-y-0.5 hover:shadow-[0_6px_24px_rgba(124,58,237,0.55)]">
          Explore all events →
        </Link>
      </div>
    </section>
  );
}
