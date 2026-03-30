export default function EmptyState({
  title,
  description,
  action,
  icon: Icon,
}) {
  return (
    <div className="glass-panel rounded-[28px] px-6 py-10 text-center">
      {Icon ? (
        <div className="mx-auto mb-4 inline-flex rounded-3xl border border-cyan-300/20 bg-cyan-300/10 p-4 text-cyan-100">
          <Icon size={22} />
        </div>
      ) : null}
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-400">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
