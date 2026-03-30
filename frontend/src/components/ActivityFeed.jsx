import { Activity, PlusCircle } from "lucide-react";
import { calculateBatchMetrics } from "../utils/batch";
import {
  formatCurrency,
  formatRelativeTime,
  getInitials,
} from "../utils/format";

export default function ActivityFeed({ batch }) {
  const { activity } = calculateBatchMetrics(batch);

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Activity feed
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Live order events
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-cyan-100">
          <Activity size={18} />
        </div>
      </div>

      <div className="space-y-4">
        {activity.length ? (
          activity.map((entry) => (
            <div
              className="rounded-[24px] border border-white/8 bg-white/5 p-4"
              key={entry.id}
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-300/12 text-sm font-semibold text-cyan-100">
                  {getInitials(entry.user?.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <PlusCircle size={15} className="text-cyan-200" />
                      <p className="text-sm text-slate-200">
                        <span className="font-semibold text-white">
                          {entry.user?.name || "Unknown user"}
                        </span>{" "}
                        added{" "}
                        <span className="font-semibold text-white">
                          {entry.quantity}x {entry.itemName}
                        </span>
                      </p>
                    </div>
                    <span className="text-xs uppercase tracking-[0.2em] text-slate-500">
                      {formatRelativeTime(entry.createdAt)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <span className="text-slate-500">
                      Unit price {formatCurrency(entry.price)}
                    </span>
                    <span className="font-semibold text-white">
                      {formatCurrency(entry.amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-5 py-8 text-center text-sm text-slate-400">
            No activity yet. Add the first item to start the order stream.
          </div>
        )}
      </div>
    </section>
  );
}
