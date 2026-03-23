export default function SummaryPanel({ summary, batch }) {
  return (
    <aside className="surface p-5">
      <div className="mb-5">
        <p className="eyebrow">Summary</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Bill split and cart</h2>
      </div>

      <div className="grid gap-3">
        <div className="surface-soft p-4">
          <p className="text-sm text-slate-400">Total bill</p>
          <strong className="mt-2 block text-3xl font-semibold text-white">
            {summary.totalLabel}
          </strong>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="surface-soft p-4">
            <p className="text-sm text-slate-400">Your share</p>
            <strong className="mt-2 block text-lg font-semibold text-white">
              {summary.yourTotalLabel}
            </strong>
          </div>
          <div className="surface-soft p-4">
            <p className="text-sm text-slate-400">Average</p>
            <strong className="mt-2 block text-lg font-semibold text-white">
              {summary.averagePerPersonLabel}
            </strong>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Per user
          </h3>
          <span className="text-xs text-slate-500">{batch.status === "CLOSED" ? "Final" : "Live"}</span>
        </div>

        <div className="space-y-3">
          {summary.participants.map((participant) => (
            <div
              key={participant.id}
              className="surface-soft flex items-center justify-between gap-3 p-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{participant.name}</p>
                <p className="text-xs text-slate-400">{participant.itemCount} items</p>
              </div>
              <strong className="shrink-0 text-sm text-white">{participant.totalLabel}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
            Cart lines
          </h3>
          <span className="text-xs text-slate-500">{summary.items.length} rows</span>
        </div>

        <div className="space-y-3">
          {summary.items.length ? (
            summary.items.map((item) => (
              <article key={item.id} className="surface-soft p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-white">{item.name}</h4>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.quantity} x {item.ownerName} at {item.price ? `₹${item.price}` : "₹0"}
                    </p>
                  </div>
                  <strong className="shrink-0 text-sm text-white">{item.totalLabel}</strong>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 px-4 py-6 text-sm text-slate-400">
              No items yet. Use the composer below to start the shared order.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
