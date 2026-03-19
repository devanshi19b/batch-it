function MetricCard({ label, value, tone = "default" }) {
  return (
    <div className={`metric-card metric-card--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export default function Header({
  batchId,
  batchName,
  restaurantName,
  cuisine,
  inviteCode,
  memberCount,
  totalItems,
  groupTotal,
  remainingLabel,
  progress,
  batchStatus,
  copyState,
  onCopyInvite,
  onCloseBatch,
}) {
  const ringStyle = {
    background: `conic-gradient(#ff8a3d ${progress}%, rgba(255, 255, 255, 0.12) ${progress}% 100%)`,
  };

  return (
    <section className="hero-card">
      <div className="hero-copy">
        <div className="hero-kicker">
          <span className={`live-pill live-pill--${batchStatus}`}>
            {batchStatus === "live" ? "Live batch" : "Closed batch"}
          </span>
          <span>Session #{batchId ?? inviteCode}</span>
        </div>

        <div className="hero-heading">
          <div>
            <p className="eyebrow">Shared ordering session</p>
            <h1>{batchName}</h1>
            <p className="hero-subtitle">
              Ordering from <strong>{restaurantName}</strong>
              <span>{cuisine}</span>
            </p>
          </div>

          <div className="hero-actions">
            <button
              type="button"
              className="ghost-button"
              onClick={onCopyInvite}
            >
              {copyState}
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={onCloseBatch}
              disabled={batchStatus === "closed"}
            >
              {batchStatus === "live" ? "Close Batch" : "Batch Closed"}
            </button>
          </div>
        </div>

        <div className="hero-metrics">
          <MetricCard label="Members" value={memberCount} />
          <MetricCard label="Items in cart" value={totalItems} />
          <MetricCard label="Running total" value={groupTotal} tone="accent" />
        </div>
      </div>

      <aside className="hero-sidebar">
        <div className="countdown-panel">
          <div
            className={`countdown-ring ${
              batchStatus === "live" ? "countdown-ring--live" : "countdown-ring--closed"
            }`}
            style={ringStyle}
          >
            <div className="countdown-core">
              <span>{batchStatus === "live" ? "Closes in" : "Status"}</span>
              <strong>{batchStatus === "live" ? remainingLabel : "Closed"}</strong>
            </div>
          </div>

          <div className="countdown-meta">
            <p>Invite code</p>
            <strong>{inviteCode}</strong>
            <span>
              Keep the group moving with a visible timer and a clean close action.
            </span>
          </div>
        </div>
      </aside>
    </section>
  );
}
