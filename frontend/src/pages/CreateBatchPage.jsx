import {
  CalendarClock,
  MapPin,
  Plus,
  Store,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { createBatch } from "../services/batchService";
import { extractErrorMessage } from "../services/api";
import { toDateTimeLocalValue } from "../utils/format";

const createStarterItem = () => ({
  id:
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `starter-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  name: "",
  quantity: 1,
  price: "",
});

export default function CreateBatchPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { pushToast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    restaurantName: "",
    buildingId: "",
    expiresAt: toDateTimeLocalValue(),
    items: [createStarterItem()],
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleItemChange = (id, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addStarterRow = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, createStarterItem()],
    }));
  };

  const removeStarterRow = (id) => {
    setForm((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? [createStarterItem()]
          : current.items.filter((item) => item.id !== id),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        restaurantName: form.restaurantName.trim(),
        buildingId: form.buildingId.trim(),
        expiresAt: new Date(form.expiresAt).toISOString(),
        items: form.items
          .filter((item) => item.name.trim() && Number(item.price) > 0)
          .map((item) => ({
            name: item.name.trim(),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
      };

      const result = await createBatch(payload, session);

      pushToast({
        title: "Batch created",
        description:
          result.source === "backend"
            ? "Your team can start adding items right away."
            : "Created in demo mode because the backend was unavailable.",
        tone: result.source === "backend" ? "success" : "warning",
      });

      navigate(`/batches/${result.data._id}`);
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to create batch."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <section className="glass-panel-strong rounded-[32px] p-6 sm:p-8">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-100">
            Create batch
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">
            Open a new ordering window with structure from the start.
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            Set the restaurant, the delivery zone, and the closeout deadline.
            You can even preload initial items for the team.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <Store size={13} />
                Restaurant name
              </label>
              <input
                className="input-shell"
                name="restaurantName"
                onChange={handleChange}
                placeholder="Midnight Greens"
                required
                value={form.restaurantName}
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                <MapPin size={13} />
                Building or delivery zone
              </label>
              <input
                className="input-shell"
                name="buildingId"
                onChange={handleChange}
                placeholder="North Tower · 7F"
                required
                value={form.buildingId}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              <CalendarClock size={13} />
              Batch closes at
            </label>
            <input
              className="input-shell"
              min={toDateTimeLocalValue(new Date())}
              name="expiresAt"
              onChange={handleChange}
              required
              type="datetime-local"
              value={form.expiresAt}
            />
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/4 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-white">Starter items</p>
                <p className="mt-1 text-sm text-slate-400">
                  Optional. Seed the batch with your first order line items.
                </p>
              </div>
              <button className="button-secondary !rounded-full !px-4 !py-2" onClick={addStarterRow} type="button">
                <Plus size={15} />
                Add row
              </button>
            </div>

            <div className="space-y-4">
              {form.items.map((item) => (
                <div
                  className="grid gap-3 rounded-[24px] border border-white/8 bg-slate-950/40 p-4 md:grid-cols-[1fr_140px_140px_auto]"
                  key={item.id}
                >
                  <input
                    className="input-shell"
                    onChange={(event) =>
                      handleItemChange(item.id, "name", event.target.value)
                    }
                    placeholder="Miso Grain Bowl"
                    value={item.name}
                  />
                  <input
                    className="input-shell"
                    min="1"
                    onChange={(event) =>
                      handleItemChange(item.id, "quantity", event.target.value)
                    }
                    step="1"
                    type="number"
                    value={item.quantity}
                  />
                  <input
                    className="input-shell"
                    min="0.01"
                    onChange={(event) =>
                      handleItemChange(item.id, "price", event.target.value)
                    }
                    placeholder="12.50"
                    step="0.01"
                    type="number"
                    value={item.price}
                  />
                  <button
                    className="button-secondary !px-4"
                    onClick={() => removeStarterRow(item.id)}
                    type="button"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error ? (
            <div className="rounded-[20px] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          <button className="button-primary" disabled={submitting} type="submit">
            <Plus size={18} />
            {submitting ? "Creating batch..." : "Launch batch"}
          </button>
        </form>
      </section>

      <aside className="space-y-5">
        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Launch checklist
          </p>
          <div className="mt-4 space-y-4 text-sm leading-7 text-slate-300">
            <p>1. Choose the restaurant and delivery zone.</p>
            <p>2. Set a clear close time so teammates know the deadline.</p>
            <p>3. Seed common items if the group already aligned on staples.</p>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Data mode
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
            {session?.provider === "demo" ? "Demo fallback" : "Backend-first"}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Protected writes use your backend when you are signed in with a real
            JWT. Demo sign-in automatically routes create and add-item flows
            into local storage so the interface remains interactive.
          </p>
        </div>
      </aside>
    </div>
  );
}
