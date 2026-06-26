import { Link } from 'react-router-dom';
import Navbar from '../../Components/Navbar/Navbar';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080808] text-[#f8fafc]">
      <Navbar page="/" />
      <main className="flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-[480px]">
          <span
            className="block text-[clamp(5rem,18vw,10rem)] font-extrabold leading-none bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] bg-clip-text text-transparent mb-4 tracking-[-0.04em]"
            aria-hidden="true">
            404
          </span>
          <h1 className="m-0 mb-3 text-[clamp(1.5rem,4vw,2rem)] font-semibold text-[#f8fafc]">
            Page not found
          </h1>
          <p className="m-0 mb-8 text-base text-[rgba(248,250,252,0.6)] leading-relaxed">
            The page you're looking for doesn't exist or may have been moved.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              to="/"
              className="inline-block py-[0.7rem] px-6 rounded-[8px] font-semibold text-[0.95rem] no-underline bg-[#7c3aed] text-white transition-[background,transform,box-shadow] duration-200 hover:bg-[#6d28d9] hover:-translate-y-px hover:shadow-[0_6px_20px_rgba(124,58,237,0.35)]">
              Go home
            </Link>
            <Link
              to="/events"
              className="inline-block py-[0.7rem] px-6 rounded-[8px] font-semibold text-[0.95rem] no-underline bg-transparent text-[rgba(248,250,252,0.7)] border border-[rgba(248,250,252,0.2)] transition-[background,color,border-color] duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-[#f8fafc] hover:border-[rgba(248,250,252,0.4)]">
              Browse events
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
