import { ArrowRight, Clock3, MapPin, Receipt, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { calculateBatchMetrics } from "../utils/batch";
import { formatCurrency, formatDateTime, getTimeRemaining } from "../utils/format";
import StatusBadge from "./StatusBadge";

export default function BatchCard({ batch }) {
  const metrics = calculateBatchMetrics(batch);
  const time = getTimeRemaining(batch.expiresAt);

  return (
    <Link
      className="glass-panel card-hover-glow group block rounded-[30px] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300/24 hover:bg-slate-900/75 hover:shadow-[0_30px_60px_rgba(3,8,18,0.6)]"
      to={`/batches/${batch._id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-slate-500">
            {batch.buildingId}
          </p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight text-white">
            {batch.restaurantName}
          </h3>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-400">
        <Clock3 size={16} className={`transition-colors duration-300 ${time.isExpired ? "text-rose-300" : ""}`} />
        <span>{time.label}</span>
        <span className="text-slate-600">•</span>
        <span>{formatDateTime(batch.expiresAt)}</span>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            icon: Receipt,
            label: "Items",
            value: metrics.totalItems,
          },
          {
            icon: Users,
            label: "People",
            value: metrics.users.length,
          },
          {
            icon: MapPin,
            label: "Bill",
            value: formatCurrency(metrics.totalAmount),
          },
        ].map(({ icon: Icon, label, value }) => (
          <div
            className="rounded-[24px] border border-white/8 bg-white/6 p-4 transition-all duration-300 group-hover:bg-white/8"
            key={label}
          >
            <div className="mb-3 inline-flex rounded-2xl border border-white/10 bg-slate-900/65 p-2 text-cyan-100">
              <Icon size={15} />
            </div>
            <p className="text-lg font-semibold text-white">{value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm">
        <span className="text-slate-400">
          Created by {batch.initiator?.name || "Batch owner"}
        </span>
        <span className="inline-flex items-center gap-2 font-medium text-cyan-100 transition-all duration-300 group-hover:gap-3">
          Open workspace
          <ArrowRight
            className="transition-transform duration-300 group-hover:translate-x-1"
            size={16}
          />
        </span>
      </div>
    </Link>
  );
}
