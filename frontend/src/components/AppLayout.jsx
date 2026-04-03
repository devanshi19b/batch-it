import { Bell, Layers3, LogOut, Plus, Sparkles } from "lucide-react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const navLinkClassName = ({ isActive }) =>
  [
    "rounded-full px-4 py-2 text-sm transition-all duration-200",
    isActive
      ? "bg-white/12 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
      : "text-slate-400 hover:bg-white/6 hover:text-slate-100",
  ].join(" ");

export default function AppLayout() {
  const { logout, user, isDemoMode } = useAuth();
  const location = useLocation();

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="ambient-orb left-[-8rem] top-24 h-48 w-48 bg-cyan-400/20" />
      <div className="ambient-orb right-[-5rem] top-40 h-44 w-44 bg-amber-300/16 [animation-delay:1.5s]" />

      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col rounded-[32px] border border-white/10 bg-slate-950/55 shadow-[0_30px_120px_rgba(3,8,18,0.55)] backdrop-blur-xl">
        <header className="flex flex-col gap-5 px-5 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300/90 via-sky-400/90 to-blue-500/90 text-slate-950 shadow-[0_12px_32px_rgba(56,189,248,0.28)]">
              <Layers3 size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-lg font-semibold tracking-tight text-white">
                  Batch-It
                </p>
                <span className="rounded-full border border-white/10 bg-white/6 px-2 py-1 text-[11px] uppercase tracking-[0.28em] text-slate-400">
                  collaborative ops
                </span>
              </div>
              <p className="text-sm text-slate-400">
                Group ordering with a calmer command center.
              </p>
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 lg:items-end">
            <nav className="flex flex-wrap items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1.5">
              <NavLink className={navLinkClassName} to="/dashboard">
                Dashboard
              </NavLink>
              <NavLink className={navLinkClassName} to="/batches/new">
                Create Batch
              </NavLink>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2 text-xs text-slate-300">
                <Bell size={15} />
                Live board
              </span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium transition-colors duration-300 ${
                  isDemoMode
                    ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
                    : "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
                }`}
              >
                <span className="relative flex h-2 w-2">
                  <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isDemoMode ? 'bg-amber-300' : 'bg-cyan-300'}`} />
                  <span className={`relative inline-flex h-2 w-2 rounded-full ${isDemoMode ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                </span>
                {isDemoMode ? "Demo fallback active" : "Connected to backend"}
              </span>

              <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
                {user?.name || "Workspace member"}
              </div>

              <button
                className="button-secondary !rounded-full !px-4 !py-2"
                onClick={logout}
                type="button"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </div>
        </header>

        {/* Animated gradient divider line */}
        <div className="gradient-line" />

        <main
          className={`page-enter flex-1 px-5 py-6 sm:px-8 sm:py-8 ${
            location.pathname.includes("/batches/") &&
            !location.pathname.includes("/new")
              ? "pb-28"
              : "pb-8"
          }`}
          key={location.pathname}
        >
          <Outlet />
        </main>

        <div className="gradient-line" />

        <div className="flex items-center justify-between px-5 py-4 text-xs text-slate-500 sm:px-8">
          <p>Real-time group ordering for teams, labs, and floor ops.</p>
          <Link className="button-secondary !rounded-full !px-4 !py-2 text-xs" to="/batches/new">
            <Plus size={14} />
            New batch
          </Link>
        </div>
      </div>
    </div>
  );
}
