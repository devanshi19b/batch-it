import { Activity, Clock3, Sparkles, WalletCards } from "lucide-react";

const highlights = [
  {
    icon: Activity,
    title: "Live activity feed",
    description: "See every order change and contributor update as it lands.",
  },
  {
    icon: WalletCards,
    title: "Instant contribution math",
    description: "Every member's share stays clear without spreadsheet cleanup.",
  },
  {
    icon: Clock3,
    title: "Deadline-first workflow",
    description: "Close windows cleanly before a batch slips into chaos.",
  },
];

export default function BrandPanel() {
  return (
    <section className="glass-panel-strong relative hidden min-h-[680px] overflow-hidden rounded-[32px] p-10 lg:flex lg:flex-col lg:justify-between">
      <div className="ambient-orb left-[-5rem] top-[-3rem] h-44 w-44 bg-cyan-300/20" />
      <div className="ambient-orb bottom-[-2rem] right-[-3rem] h-36 w-36 bg-amber-300/14 [animation-delay:2.4s]" />

      <div className="relative z-10 space-y-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-cyan-100">
          <Sparkles size={14} />
          Modern group ordering
        </span>

        <div className="space-y-4">
          <h1 className="max-w-lg text-5xl font-semibold leading-[1.02] tracking-tight">
            <span className="text-gradient">Turn shared lunch orders</span>{" "}
            <span className="text-white">into a clean operating rhythm.</span>
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-300">
            Batch-It gives teams a shared command surface for batch ordering,
            live activity, and contribution tracking without the back-and-forth.
          </p>
        </div>
      </div>

      <div className="relative z-10 mt-8 grid gap-4">
        <div className="glass-panel rounded-[28px] p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Batch health</p>
              <p className="mt-1 text-3xl font-semibold text-white stat-value">98.4%</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-300/25 bg-emerald-300/12 px-3 py-2 text-sm text-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              On schedule
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3 stagger-enter">
            {highlights.map(({ icon: Icon, title, description }) => (
              <div
                className="rounded-3xl border border-white/8 bg-slate-900/50 p-4 transition-all duration-300 hover:border-cyan-300/20 hover:bg-slate-900/70"
                key={title}
              >
                <div className="mb-3 inline-flex rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-2 text-cyan-100">
                  <Icon size={16} />
                </div>
                <h3 className="text-sm font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3 stagger-enter">
          {[
            ["21", "active members"],
            ["6", "batches closing soon"],
            ["$782", "tracked today"],
          ].map(([value, label]) => (
            <div
              className="glass-panel rounded-[24px] p-5 text-center transition-all duration-300 hover:border-cyan-300/20"
              key={label}
            >
              <p className="text-3xl font-semibold text-white stat-value">{value}</p>
              <p className="mt-2 text-sm text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
