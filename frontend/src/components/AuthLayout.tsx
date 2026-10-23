import { Link, Outlet } from "react-router-dom";
import { Logo } from "./ui";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-10 overflow-hidden bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-pink-50/40">
      {/* Decorative ambient orbs */}
      <div className="pointer-events-none absolute -top-24 -left-24 size-96 rounded-full bg-gradient-to-tr from-indigo-400/20 to-purple-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 size-96 rounded-full bg-gradient-to-tr from-pink-400/20 to-accent/20 blur-3xl" />

      <div className="relative z-10 w-full max-w-[420px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 group">
          <Logo size={34} />
          <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-ink via-ink to-accent bg-clip-text text-transparent group-hover:to-pink-500 transition-all">
            Pulse
          </span>
        </Link>
        <div className="rounded-3xl border border-white/80 bg-surface/90 p-8 shadow-xl shadow-indigo-500/5 backdrop-blur-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
