import { Plus } from "lucide-react";
import { useState } from "react";

const defaultForm = {
  name: "",
  quantity: 1,
  price: "",
};

export default function AddItemComposer({ disabled, onSubmit, pending }) {
  const [form, setForm] = useState(defaultForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    await onSubmit({
      name: form.name.trim(),
      quantity: Number(form.quantity),
      price: Number(form.price),
    });

    setForm(defaultForm);
  };

  return (
    <form
      className="glass-panel-strong sticky bottom-4 z-20 mt-6 rounded-[30px] border border-cyan-300/12 p-4 shadow-[0_28px_80px_rgba(3,8,18,0.58)]"
      onSubmit={handleSubmit}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
            Item name
          </label>
          <input
            className="input-shell"
            disabled={disabled || pending}
            name="name"
            onChange={handleChange}
            placeholder="Add a dish, drink, or shared item"
            required
            value={form.name}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:w-[280px]">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Quantity
            </label>
            <input
              className="input-shell"
              disabled={disabled || pending}
              min="1"
              name="quantity"
              onChange={handleChange}
              required
              step="1"
              type="number"
              value={form.quantity}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              Unit price
            </label>
            <input
              className="input-shell"
              disabled={disabled || pending}
              min="0.01"
              name="price"
              onChange={handleChange}
              placeholder="12.50"
              required
              step="0.01"
              type="number"
              value={form.price}
            />
          </div>
        </div>

        <button
          className="button-primary mt-1 min-w-[170px] self-end lg:mt-7"
          disabled={disabled || pending}
          type="submit"
        >
          <Plus size={18} />
          {pending ? "Adding item..." : "Add item"}
        </button>
      </div>
    </form>
  );
}
