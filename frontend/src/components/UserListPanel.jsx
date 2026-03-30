import { Crown, ReceiptText, Users } from "lucide-react";
import { calculateBatchMetrics } from "../utils/batch";
import { formatCurrency, getInitials } from "../utils/format";

export default function UserListPanel({ batch, currentUserId }) {
  const { contributors, users } = calculateBatchMetrics(batch);

  return (
    <section className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Participants
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            Who’s in this batch
          </h2>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/6 p-3 text-cyan-100">
          <Users size={18} />
        </div>
      </div>

      <div className="space-y-3">
        {users.map((user) => {
          const contribution = contributors.find(
            (entry) => (entry.user?.id || entry.user?._id) === (user.id || user._id)
          );
          const isOwner =
            (batch.initiator?.id || batch.initiator?._id) === (user.id || user._id);

          return (
            <div
              className={`rounded-[24px] border p-4 ${
                currentUserId === (user.id || user._id)
                  ? "border-cyan-300/24 bg-cyan-300/10"
                  : "border-white/8 bg-white/5"
              }`}
              key={user.id || user._id}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900/80 text-sm font-semibold text-white">
                  {getInitials(user.name)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {user.name}
                    </p>
                    {isOwner ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-300/12 px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-amber-100">
                        <Crown size={10} />
                        owner
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 truncate text-sm text-slate-500">
                    {user.email || "No email available"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-3 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <ReceiptText size={15} />
                  <span>{contribution?.lineItems || 0} line items</span>
                </div>
                <span className="font-semibold text-white">
                  {formatCurrency(contribution?.amount || 0)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
