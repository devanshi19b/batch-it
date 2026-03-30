import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";

const toneMap = {
  success: {
    icon: CheckCircle2,
    style: "border-emerald-300/25 bg-emerald-300/12 text-emerald-50",
  },
  warning: {
    icon: TriangleAlert,
    style: "border-amber-300/25 bg-amber-300/12 text-amber-50",
  },
  error: {
    icon: TriangleAlert,
    style: "border-rose-300/25 bg-rose-300/12 text-rose-50",
  },
  info: {
    icon: Info,
    style: "border-cyan-300/25 bg-cyan-300/12 text-cyan-50",
  },
};

export default function ToastViewport({ toasts, onDismiss }) {
  return (
    <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      {toasts.map((toast) => {
        const tone = toneMap[toast.tone] || toneMap.info;
        const Icon = tone.icon;

        return (
          <div
            className={`pointer-events-auto glass-panel-strong rounded-[24px] border px-4 py-4 shadow-[0_20px_50px_rgba(2,6,23,0.48)] ${tone.style}`}
            key={toast.id}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-2xl bg-black/15 p-2">
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{toast.title}</p>
                {toast.description ? (
                  <p className="mt-1 text-sm leading-6 text-white/75">
                    {toast.description}
                  </p>
                ) : null}
              </div>
              <button
                className="rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
                onClick={() => onDismiss(toast.id)}
                type="button"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
