export default function ActivityFeed({
  entries,
  batchStatus,
  remainingLabel,
}) {
  return (
    <aside className="panel panel--activity">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Activity</p>
          <h2>Live order feed</h2>
        </div>
        <span className={`panel-badge panel-badge--${batchStatus}`}>
          {batchStatus === "live" ? `${remainingLabel} left` : "Session ended"}
        </span>
      </div>

      <div className="activity-list">
        {entries.map((entry, index) => (
          <article
            key={entry.id}
            className={`activity-item activity-item--${entry.tone}`}
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <div
              className="avatar-chip avatar-chip--small"
              style={{ "--avatar-accent": entry.participant.accent }}
            >
              {entry.initials}
            </div>

            <div className="activity-copy">
              <p>
                <strong>{entry.participant.name}</strong> {entry.action}
              </p>
              <span>{entry.detail}</span>
            </div>

            <time>{entry.time}</time>
          </article>
        ))}
      </div>
    </aside>
  );
}
