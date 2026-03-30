export function BatchCardSkeleton() {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 h-4 w-24 rounded-full bg-white/10 [animation:pulse-line_1.6s_ease-in-out_infinite]" />
      <div className="space-y-3">
        <div className="h-8 w-2/3 rounded-full bg-white/10 [animation:pulse-line_1.6s_ease-in-out_infinite]" />
        <div className="h-4 w-full rounded-full bg-white/8 [animation:pulse-line_1.6s_ease-in-out_infinite]" />
        <div className="h-4 w-5/6 rounded-full bg-white/8 [animation:pulse-line_1.6s_ease-in-out_infinite]" />
      </div>
      <div className="mt-6 grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            className="h-16 rounded-2xl bg-white/7 [animation:pulse-line_1.6s_ease-in-out_infinite]"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}

export function PanelSkeleton({ lines = 5 }) {
  return (
    <div className="glass-panel rounded-[28px] p-6">
      <div className="mb-5 h-5 w-32 rounded-full bg-white/10 [animation:pulse-line_1.6s_ease-in-out_infinite]" />
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            className="h-14 rounded-2xl bg-white/8 [animation:pulse-line_1.6s_ease-in-out_infinite]"
            key={index}
          />
        ))}
      </div>
    </div>
  );
}
