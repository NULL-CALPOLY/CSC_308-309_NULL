import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar.jsx';
import community from '../../assets/community.svg';
import LEBRON from '../../assets/LEBRON.mp4';
import { useAuth } from '../../Hooks/UseAuth';
import { useModal } from '../../Components/ModalContext.jsx';
import LandingEventPreview from '../../Components/LandingEventPreview/LandingEventPreview.jsx';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const { openSignIn, openRegister } = useModal();

  const ctaCls = "inline-block bg-[#7c3aed] text-white py-4 px-9 rounded-full font-semibold text-[1.05rem] no-underline border-none cursor-pointer shadow-[0_0_30px_rgba(124,58,237,0.45)] font-[inherit] transition-[transform,background,box-shadow] duration-[180ms] ease-[ease] hover:no-underline hover:bg-[#6d28d9] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(124,58,237,0.6)]";

  const generalLinkCls = "general-link bg-none border-none p-0 font-[inherit] cursor-pointer text-[#a78bfa] no-underline font-semibold text-[1rem] inline-flex items-center gap-[0.35rem] transition-[color,gap] duration-[180ms] ease-[ease] hover:text-[#c4b5fd] focus-visible:outline-[2px] focus-visible:outline-[#7c3aed] focus-visible:outline-offset-[3px] focus-visible:rounded-[3px]";

  return (
    <div className="landing-page min-h-screen flex flex-col bg-[#0a0a0f] text-[#f8fafc]">
      <header className="fixed top-0 w-full z-[1000]">
        <Navbar page="/" />
      </header>

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="hero-section min-h-screen flex items-center justify-center text-center px-6 relative overflow-hidden max-[480px]:px-5"
          style={{
            background: 'radial-gradient(ellipse 140% 90% at 50% -10%, rgba(124,58,237,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(96,165,250,0.12) 0%, transparent 50%), #0a0a0f',
          }}>
          <div className="max-w-[760px] pb-20 relative z-[1] max-[480px]:pb-15">
            <h1
              className="text-[clamp(4rem,10vw,7rem)] font-bold mb-5 tracking-[-0.04em] leading-none max-[480px]:text-[2.1rem]"
              style={{
                background: 'linear-gradient(135deg, #c4b5fd 0%, #a78bfa 40%, #7c3aed 80%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
              Findr
            </h1>
            <p className="text-[clamp(1.1rem,2.5vw,1.4rem)] font-normal mb-10 text-[rgba(248,250,252,0.65)] max-w-[560px] mx-auto leading-[1.6] max-[480px]:text-[0.95rem] max-[480px]:mb-6">
              Your go-to platform for connecting with others and discovering new interests
            </p>
            {!isAuthenticated ? (
              <button className={ctaCls} onClick={openRegister}>Get Started!</button>
            ) : (
              <Link to="/home" className={ctaCls}>Get Started!</Link>
            )}
          </div>
        </section>

        {/* Live, public taste of the product — real upcoming events. */}
        <LandingEventPreview />

        {/* ── Connect section ── */}
        <section className="flex items-center justify-center py-24 px-8 bg-[#0f0f18] max-[768px]:py-16 max-[768px]:px-6">
          <div className="w-[min(1200px,100%)] text-center">
            <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 mb-10">
              {[
                {
                  title: 'Smart Matchmaking',
                  body: 'Get matched with people based on shared interests, availability, and location.',
                },
                {
                  title: 'Event Creation & RSVP',
                  body: "Create hangouts, study sessions, or group events and see who's coming.",
                },
                {
                  title: 'Safety & Verification',
                  body: 'Cal Poly students can verify with their school email, and you control who sees your profile and events.',
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-10 text-left transition-[border-color,transform] duration-200 ease-[ease] hover:border-[rgba(124,58,237,0.4)] hover:-translate-y-[3px] max-[480px]:p-8">
                  <h2 className="text-[1.25rem] font-semibold text-[#f8fafc] m-0 mb-3">{title}</h2>
                  <p className="text-[0.95rem] text-[rgba(248,250,252,0.6)] leading-[1.65] m-0">{body}</p>
                </div>
              ))}
            </div>
            {!isAuthenticated ? (
              <button className={generalLinkCls} onClick={openSignIn}>Learn More</button>
            ) : (
              <Link to="/home" className={generalLinkCls}>Learn More</Link>
            )}
          </div>
        </section>

        {/* ── Community section ── */}
        <section className="flex items-center justify-center py-24 px-8 bg-[#0a0a0f] max-[768px]:py-16 max-[768px]:px-6">
          <div className="w-[min(1200px,100%)] flex items-center gap-14 text-left max-[900px]:flex-col max-[900px]:gap-8 max-[900px]:text-center">
            <div className="flex-1 min-w-0">
              <img src={community} alt="Community" className="w-full h-auto rounded-[16px] border border-[rgba(255,255,255,0.08)] block" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#f8fafc] m-0 mb-4 tracking-[-0.02em] max-[480px]:text-[1.55rem]">
                Be part of a community
              </h2>
              <p className="text-[1.05rem] text-[rgba(248,250,252,0.6)] leading-[1.7] m-0 mb-7 max-[480px]:text-[1rem] max-[480px]:mb-5">
                Join groups and activities that interest you, and build lasting connections.
              </p>
              {!isAuthenticated ? (
                <button className={`${generalLinkCls} max-[900px]:justify-center`} onClick={openSignIn}>Join the Community</button>
              ) : (
                <Link to="/home" className={`${generalLinkCls} max-[900px]:justify-center`}>Join the Community</Link>
              )}
            </div>
          </div>
        </section>

        {/* ── Discover section ── */}
        <section className="flex items-center justify-center py-24 px-8 bg-[#0f0f18] max-[768px]:py-16 max-[768px]:px-6">
          <div className="w-[min(1200px,100%)] flex items-center gap-14 text-left max-[900px]:flex-col max-[900px]:gap-8 max-[900px]:text-center">
            <div className="flex-1 min-w-0">
              <h2 className="text-[clamp(1.75rem,3vw,2.5rem)] font-semibold text-[#f8fafc] m-0 mb-4 tracking-[-0.02em] max-[480px]:text-[1.55rem]">
                Discover new interests
              </h2>
              <p className="text-[1.05rem] text-[rgba(248,250,252,0.6)] leading-[1.7] m-0 mb-7 max-[480px]:text-[1rem] max-[480px]:mb-5">
                Explore activities and hobbies you've never tried before, and expand your horizons.
              </p>
              {!isAuthenticated ? (
                <button className={`${generalLinkCls} max-[900px]:justify-center`} onClick={openSignIn}>Discover Now</button>
              ) : (
                <Link to="/home" className={`${generalLinkCls} max-[900px]:justify-center`}>Discover Now</Link>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <video src={LEBRON} autoPlay muted loop playsInline className="w-full h-auto rounded-[16px] border border-[rgba(255,255,255,0.08)] block" />
            </div>
          </div>
        </section>

        {/* ── Newsletter/CTA ── */}
        <section
          className="flex items-center justify-center py-24 px-8 text-center border-t border-[rgba(124,58,237,0.25)] max-[768px]:py-16 max-[768px]:px-6 max-[480px]:py-10 max-[480px]:px-4"
          style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0d1420 100%)' }}>
          <div className="max-w-[560px] mx-auto">
            <h2 className="text-[clamp(1.8rem,4vw,2.5rem)] font-semibold text-[#f8fafc] m-0 mb-4 tracking-[-0.02em] max-[480px]:text-[1.6rem]">
              Ready to find your people?
            </h2>
            <p className="text-[1.05rem] text-[rgba(248,250,252,0.6)] m-0 mb-9 leading-[1.65] max-[480px]:text-[1rem] max-[480px]:mb-5">
              Join Findr to RSVP, host your own events, and connect with your community.
            </p>
            {!isAuthenticated ? (
              <button className={ctaCls} onClick={openRegister}>Create your account</button>
            ) : (
              <Link to="/events" className={ctaCls}>Explore events</Link>
            )}
          </div>
        </section>
      </main>

      <footer className="bg-[#050508] border-t border-[rgba(255,255,255,0.07)] py-9 px-8 text-center">
        <div>
          <p className="m-0 mb-3 text-[rgba(248,250,252,0.35)] text-[0.875rem]">&copy; 2026 Findr. All rights reserved.</p>
          <div className="flex justify-center gap-8 flex-wrap max-[480px]:gap-6">
            <Link to="/events" className="text-[rgba(248,250,252,0.5)] no-underline text-[0.875rem] transition-colors duration-[180ms] ease-[ease] hover:text-[#a78bfa]">Events</Link>
            <Link to="/clubs" className="text-[rgba(248,250,252,0.5)] no-underline text-[0.875rem] transition-colors duration-[180ms] ease-[ease] hover:text-[#a78bfa]">Clubs</Link>
            <a href="mailto:hello@findr.page" className="text-[rgba(248,250,252,0.5)] no-underline text-[0.875rem] transition-colors duration-[180ms] ease-[ease] hover:text-[#a78bfa]">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
