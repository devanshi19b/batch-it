export default function CreateBatchModal({
  isOpen,
  values,
  onChange,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 px-4 backdrop-blur-md">
      <div className="surface w-full max-w-2xl p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="eyebrow">New batch</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">Launch a shared order room</h2>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Pick the restaurant, choose the location, and define when the room should close.
            </p>
          </div>
          <button type="button" className="btn-secondary px-3 py-2" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-8 grid gap-5 sm:grid-cols-2" onSubmit={onSubmit}>
          <div>
            <label className="field-label" htmlFor="restaurantName">
              Restaurant
            </label>
            <input
              id="restaurantName"
              className="field-input"
              name="restaurantName"
              value={values.restaurantName}
              onChange={onChange}
              placeholder="Nomad Kitchen"
              required
            />
          </div>

          <div>
            <label className="field-label" htmlFor="buildingId">
              Location
            </label>
            <input
              id="buildingId"
              className="field-input"
              name="buildingId"
              value={values.buildingId}
              onChange={onChange}
              placeholder="Tower B, 7th floor"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="field-label" htmlFor="expiresAt">
              Close time
            </label>
            <input
              id="expiresAt"
              className="field-input"
              type="datetime-local"
              name="expiresAt"
              value={values.expiresAt}
              onChange={onChange}
              required
            />
          </div>

          <div className="sm:col-span-2 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Batch"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
