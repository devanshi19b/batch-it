import { calculateBatchMetrics, canRemoveBatchItem } from "../utils/batch";
import { formatCurrency, formatDateTime } from "../utils/format";

export default function BatchItemList({
  actionIcon: ActionIcon,
  batch,
  currentUserId,
  onRemoveItem,
  removing,
}) {
  const { activity } = calculateBatchMetrics(batch);

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="mb-5">
        <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
          Current items
        </p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
          Everything in the cart
        </h2>
      </div>

      <div className="space-y-3">
        {activity.length ? (
          activity.map((entry) => (
            <div
              className="flex flex-col gap-3 rounded-[24px] border border-white/8 bg-white/5 p-4 sm:flex-row sm:items-center sm:justify-between"
              key={`item-${entry.id}`}
            >
              <div>
                <p className="text-sm font-semibold text-white">
                  {entry.quantity}x {entry.itemName}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Added by {entry.user?.name || "Unknown user"} on{" "}
                  {formatDateTime(entry.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-slate-500">
                  {formatCurrency(entry.price)} each
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {formatCurrency(entry.amount)}
                </p>
              </div>
              {typeof onRemoveItem === "function" &&
              canRemoveBatchItem({
                batch,
                currentUserId,
                itemUser: entry.user,
              }) ? (
                <button
                  className="button-secondary !px-4"
                  disabled={removing}
                  onClick={() => onRemoveItem(entry.id)}
                  type="button"
                >
                  {ActionIcon ? <ActionIcon size={16} /> : null}
                  Remove
                </button>
              ) : null}
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/4 px-4 py-6 text-sm text-slate-400">
            No items yet. The sticky composer below is ready for the first order.
          </div>
        )}
      </div>
    </section>
  );
}
