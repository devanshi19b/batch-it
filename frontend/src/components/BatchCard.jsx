import { Link } from "react-router-dom";

export default function BatchCard({ batch, index }) {
  return (
    <Link
      to={`/batch/${batch.id}`}
      className="surface group flex h-full flex-col justify-between overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:bg-white/[0.08] hover:shadow-[0_24px_60px_rgba(14,165,233,0.16)]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div>
        <div className="flex items-center justify-between gap-3">
          <span className={`pill ${batch.status === "CLOSED" ? "border-rose-400/30 text-rose-100" : "border-emerald-300/30 text-emerald-100"}`}>
            {batch.chipLabel}
          </span>
          <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
            {batch.countdownLabel}
          </span>
        </div>

        <div className="mt-5">
          <p className="eyebrow">Shared batch</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">{batch.title}</h3>
          <p className="mt-2 text-sm text-slate-400">{batch.location}</p>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">People</p>
            <strong className="mt-2 block text-lg text-white">{batch.participantCount}</strong>
          </div>
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Items</p>
            <strong className="mt-2 block text-lg text-white">{batch.itemCount}</strong>
          </div>
          <div className="surface-soft p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Total</p>
            <strong className="mt-2 block text-lg text-white">{batch.totalLabel}</strong>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Host</p>
          <p className="mt-2 text-sm font-semibold text-slate-200">{batch.hostName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Updated</p>
          <p className="mt-2 text-sm text-slate-300">{batch.lastUpdatedLabel}</p>
        </div>
      </div>
    </Link>
  );
}
