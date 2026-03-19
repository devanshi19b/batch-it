export default function SummaryPanel({
  batchStatus,
  items,
  groupTotal,
  yourShare,
  averageShare,
}) {
  return (
    <section className="panel panel--cart">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Shared cart</p>
          <h2>Everything the group is ordering</h2>
        </div>
        <span className="panel-badge">{batchStatus === "live" ? "Syncing live" : "Finalized"}</span>
      </div>

      <div className="cart-summary-strip">
        <div>
          <span>Total cart</span>
          <strong>{groupTotal}</strong>
        </div>
        <div>
          <span>Your contribution</span>
          <strong>{yourShare}</strong>
        </div>
        <div>
          <span>Average/member</span>
          <strong>{averageShare}</strong>
        </div>
      </div>

      <div className="cart-list">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="cart-item"
            style={{ animationDelay: `${index * 80}ms` }}
          >
            <div className="cart-item-head">
              <div>
                <p className="item-category">{item.category}</p>
                <h3>{item.name}</h3>
              </div>
              <strong>{item.lineTotalLabel}</strong>
            </div>

            <div className="cart-item-meta">
              <span className="item-qty">{item.quantity}x</span>
              <span
                className="item-owner"
                style={{ "--avatar-accent": item.participant.accent }}
              >
                <span className="item-owner-avatar">{item.initials}</span>
                {item.participant.name}
              </span>
              {item.note ? <span className="item-note">{item.note}</span> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
