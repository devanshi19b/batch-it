export default function AddItemBar({
  values,
  onChange,
  onSubmit,
  isSubmitting,
  isClosed,
}) {
  return (
    <div className="sticky bottom-4 mt-6">
      <form className="surface overflow-hidden p-4 sm:p-5" onSubmit={onSubmit}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end">
          <div className="min-w-0 flex-1">
            <label className="field-label" htmlFor="itemName">
              Item name
            </label>
            <input
              id="itemName"
              className="field-input"
              name="name"
              placeholder="Smoky paneer wrap"
              value={values.name}
              onChange={onChange}
              disabled={isClosed}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:w-[260px] xl:grid-cols-2">
            <div>
              <label className="field-label" htmlFor="itemQuantity">
                Quantity
              </label>
              <input
                id="itemQuantity"
                className="field-input"
                type="number"
                min="1"
                step="1"
                name="quantity"
                value={values.quantity}
                onChange={onChange}
                disabled={isClosed}
                required
              />
            </div>

            <div>
              <label className="field-label" htmlFor="itemPrice">
                Price
              </label>
              <input
                id="itemPrice"
                className="field-input"
                type="number"
                min="1"
                step="0.01"
                name="price"
                value={values.price}
                onChange={onChange}
                disabled={isClosed}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary xl:min-w-[190px]"
            disabled={isClosed || isSubmitting}
          >
            {isClosed ? "Batch Closed" : isSubmitting ? "Adding..." : "Add Item"}
          </button>
        </div>
      </form>
    </div>
  );
}
