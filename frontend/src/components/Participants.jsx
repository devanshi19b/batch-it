export default function Participants({ participants, currentUserId }) {
  return (
    <aside className="surface p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Participants</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Who’s in this batch</h2>
        </div>
        <span className="pill">{participants.length} active</span>
      </div>

      <div className="space-y-3">
        {participants.map((participant) => (
          <article
            key={participant.id}
            className="surface-soft flex items-start gap-4 p-4 transition duration-200 hover:bg-white/[0.08]"
          >
            <div
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${participant.accent} text-sm font-bold text-slate-950`}
            >
              {participant.initials}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-semibold text-white">{participant.name}</h3>
                <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-300">
                  {participant.role}
                </span>
                {participant.id === currentUserId ? (
                  <span className="rounded-full bg-emerald-300/15 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200">
                    You
                  </span>
                ) : null}
              </div>
              <p className="mt-2 text-sm text-slate-400">{participant.lastAction}</p>
            </div>

            <div className="text-right">
              <strong className="block text-sm text-white">{participant.totalLabel}</strong>
              <span className="text-xs text-slate-400">{participant.itemCount} items</span>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
