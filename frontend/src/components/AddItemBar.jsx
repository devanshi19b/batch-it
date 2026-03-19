export default function AddItemBar({
  draft,
  participants,
  batchStatus,
  isSubmitting,
  onChange,
  onSubmit,
}) {
  const isClosed = batchStatus === "closed";

  return (
    <form className="composer-card" onSubmit={onSubmit}>
      <div className="composer-heading">
        <div>
          <p className="eyebrow">Add to session</p>
          <h2>Drop in a new item for the group</h2>
        </div>
        <span className={`panel-badge panel-badge--${batchStatus}`}>
          {isClosed ? "Ordering locked" : "Updates appear instantly"}
        </span>
      </div>

      <div className="composer-grid">
        <label className="field">
          <span>Item name</span>
          <input
            type="text"
            placeholder="Tandoori paneer slider"
            value={draft.name}
            onChange={onChange("name")}
            disabled={isClosed}
          />
        </label>

        <label className="field field--compact">
          <span>Qty</span>
          <input
            type="number"
            min="1"
            value={draft.quantity}
            onChange={onChange("quantity")}
            disabled={isClosed}
          />
        </label>

        <label className="field field--compact">
          <span>Price</span>
          <input
            type="number"
            min="1"
            placeholder="320"
            value={draft.price}
            onChange={onChange("price")}
            disabled={isClosed}
          />
        </label>

        <label className="field">
          <span>Who is adding it?</span>
          <select
            value={draft.participantId}
            onChange={onChange("participantId")}
            disabled={isClosed}
          >
            {participants.map((participant) => (
              <option key={participant.id} value={participant.id}>
                {participant.name} • {participant.role}
              </option>
            ))}
          </select>
        </label>

        <label className="field field--wide">
          <span>Context for the group</span>
          <input
            type="text"
            placeholder="For the table, less spicy, split three ways..."
            value={draft.note}
            onChange={onChange("note")}
            disabled={isClosed}
          />
        </label>

        <button
          type="submit"
          className="primary-button composer-button"
          disabled={isClosed || isSubmitting}
        >
          {isClosed ? "Batch closed" : isSubmitting ? "Saving..." : "Add To Shared Cart"}
        </button>
      </div>
    </form>
  );
}
