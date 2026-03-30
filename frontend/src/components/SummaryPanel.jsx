import { DollarSign, Layers3, TimerReset } from "lucide-react";
import { calculateBatchMetrics } from "../utils/batch";
import { formatCurrency, getTimeRemaining } from "../utils/format";

export default function SummaryPanel({ batch, summary }) {
  const metrics = calculateBatchMetrics(batch);
  const serverTotalAmount = summary?.totalAmount ?? metrics.totalAmount;
  const serverTotalItems = summary?.totalItems ?? metrics.totalItems;
  const time = getTimeRemaining(batch.expiresAt);

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Summary
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Bill breakdown
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-cyan-100">
          <DollarSign size={18} />
        </div>
      </div>

      <div className="grid gap-3">
        {[
          {
            icon: DollarSign,
            label: "Total bill",
            value: formatCurrency(serverTotalAmount),
          },
          {
            icon: Layers3,
            label: "Items ordered",
            value: serverTotalItems,
          },
          {
            icon: TimerReset,
            label: "Closes in",
            value: time.label,
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            className="rounded-[24px] border border-white/8 bg-slate-950/45 p-4"
            key={label}
          >
            <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-white/6 p-2 text-cyan-100">
              <Icon size={15} />
            </div>
            <p className="text-xl font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
            Per-user contribution
          </h3>
          <span className="text-sm text-slate-500">
            {metrics.contributors.length} contributors
          </span>
        </div>

        {metrics.contributors.length ? (
          metrics.contributors.map((entry) => {
            const width =
              serverTotalAmount > 0
                ? `${Math.max((entry.amount / serverTotalAmount) * 100, 6)}%`
                : "0%";

            return (
              <div
                className="rounded-[24px] border border-white/8 bg-white/5 p-4"
                key={entry.user?.id || entry.user?._id}
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {entry.user?.name || "Unknown user"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {entry.itemCount} items across {entry.lineItems} entries
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-white">
                    {formatCurrency(entry.amount)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/8">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500"
                    style={{ width }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
            Contributions appear here as soon as items are added.
          </div>
        )}
      </div>
    </section>
  );
}
