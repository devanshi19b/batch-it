import { Link } from "react-router-dom";
import { formatDateTime } from "../utils/formatters";

function Metric({ label, value, highlight = false }) {
  return (
    <div className={`metric-tile ${highlight ? "bg-white/[0.08]" : ""}`}>
      <p className="text-sm text-slate-400">{label}</p>
      <strong className="mt-2 block text-xl font-semibold text-white">{value}</strong>
    </div>
  );
}

export default function Header({
  batch,
  summary,
  inviteLink,
  onCopyInvite,
  onCloseBatch,
  isClosing,
}) {
  const isClosed = batch.status === "CLOSED";

  return (
    <section className="surface overflow-hidden p-6 sm:p-8">
      <div className="flex flex-col gap-8 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-3xl space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`pill ${isClosed ? "border-rose-400/30 text-rose-100" : "border-emerald-300/30 text-emerald-100"}`}>
              <span className={`h-2 w-2 rounded-full ${isClosed ? "bg-rose-300" : "bg-emerald-300"}`} />
              {isClosed ? "Batch closed" : "Batch live"}
            </span>
            <span className="pill">Session ID #{batch._id}</span>
            <span className="pill">Closes {formatDateTime(batch.expiresAt)}</span>
          </div>

          <div className="space-y-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-slate-100"
            >
              <span aria-hidden="true">←</span>
              Back to dashboard
            </Link>

            <div>
              <p className="eyebrow">Collaborative order room</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {batch.restaurantName}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {batch.buildingId} is ordering together. Watch items arrive live, monitor each
                person’s spend, and close the session when the group is ready.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Participants" value={summary.participantCount} />
            <Metric label="Items added" value={summary.itemCount} />
            <Metric label="Group total" value={summary.totalLabel} highlight />
            <Metric label="Countdown" value={summary.countdownLabel} />
          </div>
        </div>

        <div className="surface-soft flex w-full max-w-sm flex-col gap-5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Invite the room</p>
              <p className="mt-2 text-sm text-slate-300">
                Share this link so everyone can add their own items in the same batch.
              </p>
            </div>
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-emerald-300/20 to-cyan-300/20 text-2xl">
              ≋
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-300">
            <p className="truncate">{inviteLink}</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button type="button" className="btn-secondary" onClick={onCopyInvite}>
              Copy invite
            </button>
            <button
              type="button"
              className="btn-primary"
              onClick={onCloseBatch}
              disabled={isClosed || isClosing}
            >
              {isClosed ? "Batch Closed" : isClosing ? "Closing..." : "Close Batch"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
