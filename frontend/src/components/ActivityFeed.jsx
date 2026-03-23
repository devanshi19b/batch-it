export default function ActivityFeed({ entries, countdownLabel, status }) {
  return (
    <section className="surface min-h-[620px] p-5">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Live activity</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Shared order feed</h2>
        </div>
        <span className={`pill ${status === "CLOSED" ? "border-rose-400/30 text-rose-100" : "border-cyan-300/30 text-cyan-100"}`}>
          {status === "CLOSED" ? "Session ended" : `${countdownLabel} remaining`}
        </span>
      </div>

      <div className="space-y-4">
        {entries.length ? (
          entries.map((entry, index) => (
            <article
              key={entry.id}
              className="surface-soft flex items-start gap-4 p-4 animate-rise"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-to-br ${entry.accent} text-sm font-bold text-slate-950`}
              >
                {entry.actorInitials}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <strong className="text-sm text-white">{entry.actor}</strong>
                  <span className="text-sm text-slate-400">{entry.title}</span>
                </div>
                <p className="mt-2 text-sm text-slate-300">{entry.detail}</p>
              </div>

              <span className="shrink-0 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {entry.timeLabel}
              </span>
            </article>
          ))
        ) : (
          <div className="grid min-h-[320px] place-items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.03] p-8 text-center">
            <div className="max-w-sm">
              <p className="eyebrow">No activity yet</p>
              <h3 className="mt-3 text-2xl font-semibold text-white">The room is ready.</h3>
              <p className="mt-3 text-sm leading-7 text-slate-400">
                The first item added by anyone in the batch will appear here instantly.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
