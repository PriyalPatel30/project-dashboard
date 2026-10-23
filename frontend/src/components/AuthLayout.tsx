import { Link, Outlet } from "react-router-dom";
import { Logo } from "./ui";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen grid place-items-center px-4 py-10 overflow-hidden bg-paper text-ink">
      {/* Decorative ambient orbs with dark glow */}
      <div className="pointer-events-none absolute -top-32 -left-32 size-[480px] rounded-full bg-gradient-to-tr from-accent/25 via-purple-600/20 to-transparent blur-3xl opacity-70" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 size-[480px] rounded-full bg-gradient-to-tr from-pink-600/20 via-accent/20 to-transparent blur-3xl opacity-70" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[650px] rounded-full bg-radial from-accent/10 to-transparent blur-2xl" />

      <div className="relative z-10 w-full max-w-[440px]">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3 group">
          <Logo size={36} />
          <span className="font-display text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-accent bg-clip-text text-transparent group-hover:to-pink-400 transition-all">
            Pulse
          </span>
        </Link>
        <div className="rounded-3xl border border-line bg-surface/90 p-8 shadow-2xl shadow-black/60 backdrop-blur-xl">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
