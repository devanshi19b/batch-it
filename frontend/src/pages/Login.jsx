import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api, { getErrorMessage } from "../services/api";

const PRODUCT_POINTS = [
  "Live activity feed for every item added",
  "Shared total and per-person split in one view",
  "Fast batch creation for offices, hostels, and teams",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState(
    new URLSearchParams(location.search).get("reason") === "session-expired"
      ? "Your session expired. Please log in again."
      : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = location.state?.from || "/dashboard";

  const visualDots = useMemo(
    () => [
      { className: "left-12 top-14 h-24 w-24 bg-emerald-300/20" },
      { className: "right-10 top-32 h-32 w-32 bg-cyan-300/20" },
      { className: "bottom-12 left-1/3 h-28 w-28 bg-amber-300/20" },
    ],
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await api.post("/auth/login", form);
      login(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to sign in right now."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden">
      {visualDots.map((dot) => (
        <div
          key={dot.className}
          className={`pointer-events-none absolute rounded-full blur-3xl ${dot.className}`}
          aria-hidden="true"
        />
      ))}

      <div className="app-shell flex min-h-screen items-center py-10">
        <div className="grid w-full gap-8 xl:grid-cols-[1.08fr_0.92fr]">
          <section className="surface relative overflow-hidden p-8 sm:p-10">
            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="relative max-w-2xl space-y-8">
              <span className="pill border-emerald-300/30 text-emerald-100">
                Collaborative ordering platform
              </span>
              <div className="space-y-5">
                <p className="eyebrow">Batch-It frontend</p>
                <h1 className="max-w-2xl text-4xl font-bold leading-tight text-white sm:text-6xl">
                  Turn one food order into a live shared workspace.
                </h1>
                <p className="max-w-xl text-base leading-8 text-slate-300">
                  Batch-It feels closer to a team dashboard than a food app: everyone adds
                  items, totals update in real time, and the host closes the room when the
                  group is ready.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {PRODUCT_POINTS.map((point, index) => (
                  <article
                    key={point}
                    className="surface-soft animate-rise p-5"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      0{index + 1}
                    </span>
                    <p className="mt-3 text-sm leading-7 text-slate-200">{point}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section className="surface flex items-center p-8 sm:p-10">
            <div className="w-full">
              <div className="mb-8">
                <p className="eyebrow">Sign in</p>
                <h2 className="mt-2 text-3xl font-semibold text-white">Enter your workspace</h2>
                <p className="mt-3 text-sm leading-7 text-slate-400">
                  Use your existing backend credentials. The frontend stores the JWT locally
                  and protects every dashboard route.
                </p>
              </div>

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="field-label" htmlFor="email">
                    Email
                  </label>
                  <input
                    id="email"
                    className="field-input"
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@batchit.app"
                    required
                  />
                </div>

                <div>
                  <label className="field-label" htmlFor="password">
                    Password
                  </label>
                  <input
                    id="password"
                    className="field-input"
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                  />
                </div>

                {error ? (
                  <div className="status-banner border-rose-400/20 bg-rose-400/10 text-rose-100">
                    {error}
                  </div>
                ) : null}

                <button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Signing In..." : "Log In"}
                </button>
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
