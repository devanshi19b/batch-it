export default function Participants({
  participants,
  activeCount,
  batchStatus,
  yourShare,
}) {
  return (
    <aside className="panel panel--people">
      <div className="panel-header">
        <div>
          <p className="eyebrow">People</p>
          <h2>Group presence</h2>
        </div>
        <span className="panel-badge">{activeCount} live</span>
      </div>

      <div className="presence-stack" aria-hidden="true">
        {participants.slice(0, 4).map((participant) => (
          <span
            key={participant.id}
            className="presence-avatar"
            style={{ "--avatar-accent": participant.accent }}
          >
            {participant.initials}
          </span>
        ))}
      </div>

      <div className="people-list">
        {participants.map((participant) => (
          <article key={participant.id} className="person-row">
            <div
              className="avatar-chip"
              style={{ "--avatar-accent": participant.accent }}
            >
              {participant.initials}
            </div>

            <div className="person-copy">
              <div className="person-title">
                <strong>{participant.name}</strong>
                <span>{participant.role}</span>
              </div>
              <p>{participant.status}</p>
            </div>

            <div className="person-meta">
              <strong>{participant.total ? participant.totalLabel : "Waiting"}</strong>
              <span>{participant.itemCount} items</span>
            </div>
          </article>
        ))}
      </div>

      <div className="people-summary">
        <div>
          <span>Your current share</span>
          <strong>{yourShare}</strong>
        </div>
        <div>
          <span>Session state</span>
          <strong>{batchStatus === "live" ? "Collecting orders" : "Locked"}</strong>
        </div>
      </div>
    </aside>
  );
}
