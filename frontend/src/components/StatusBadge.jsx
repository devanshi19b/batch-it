export default function StatusBadge({ status = "LIVE" }) {
  const tone =
    status === "CLOSED"
      ? "border-rose-400/20 bg-rose-400/10 text-rose-100"
      : "border-emerald-300/20 bg-emerald-300/10 text-emerald-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${tone}`}
    >
      {status}
    </span>
  );
}
