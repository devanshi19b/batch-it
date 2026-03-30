import { ArrowRight, KeyRound, UserPlus } from "lucide-react";
import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import BrandPanel from "../components/BrandPanel";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { extractErrorMessage } from "../services/api";

const loginDefaults = {
  name: "",
  email: "",
  password: "",
};

const demoCredentials = {
  login: {
    email: "eve.holt@reqres.in",
    password: "cityslicka",
  },
  register: {
    name: "Eve Holt",
    email: "eve.holt@reqres.in",
    password: "pistol",
  },
};

export default function AuthPage() {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(loginDefaults);
  const [error, setError] = useState("");
  const { isAuthenticated, login, register, loading } = useAuth();
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  if (isAuthenticated) {
    return <Navigate replace to="/dashboard" />;
  }

  const target = location.state?.from || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const validate = () => {
    if (mode === "register" && !form.name.trim()) {
      return "Please add your name.";
    }

    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) {
      return "Please enter a valid email address.";
    }

    if (!form.password || form.password.length < 6) {
      return "Passwords must be at least 6 characters.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationMessage = validate();

    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setError("");

    try {
      const action = mode === "login" ? login : register;
      const result = await action(form);

      pushToast({
        title: mode === "login" ? "Welcome back" : "Account ready",
        description: result.message,
        tone: result.provider === "backend" ? "success" : "warning",
      });

      navigate(target, { replace: true });
    } catch (submitError) {
      setError(extractErrorMessage(submitError, "Unable to authenticate."));
    }
  };

  const fillDemo = () => {
    setForm((current) => ({
      ...current,
      ...demoCredentials[mode],
    }));
    setError("");
  };

  return (
    <div className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-7xl gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <BrandPanel />

        <section className="glass-panel-strong relative flex items-center justify-center overflow-hidden rounded-[32px] px-6 py-10 sm:px-10">
          <div className="ambient-orb right-[-6rem] top-[-4rem] h-40 w-40 bg-cyan-400/16" />
          <div className="ambient-orb bottom-[-3rem] left-[-3rem] h-36 w-36 bg-amber-300/12 [animation-delay:1.2s]" />

          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 flex items-center gap-2 rounded-full border border-white/10 bg-white/6 p-1">
              {[
                ["login", "Sign in", KeyRound],
                ["register", "Create account", UserPlus],
              ].map(([value, label, Icon]) => (
                <button
                  className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition ${
                    mode === value
                      ? "bg-white text-slate-950 shadow-lg"
                      : "text-slate-400 hover:text-slate-100"
                  }`}
                  key={value}
                  onClick={() => {
                    setMode(value);
                    setError("");
                  }}
                  type="button"
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.26em] text-cyan-100">
                Batch-It access
              </p>
              <h2 className="text-4xl font-semibold tracking-tight text-white">
                {mode === "login"
                  ? "Step back into your ordering board."
                  : "Create a workspace in minutes."}
              </h2>
              <p className="text-sm leading-7 text-slate-400">
                Primary auth uses your backend first, then falls back to ReqRes
                for UI demos if the API is unavailable.
              </p>
            </div>

            <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Name
                  </label>
                  <input
                    className="input-shell"
                    name="name"
                    onChange={handleChange}
                    placeholder="Your display name"
                    value={form.name}
                  />
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Email
                </label>
                <input
                  className="input-shell"
                  name="email"
                  onChange={handleChange}
                  placeholder="name@workspace.com"
                  type="email"
                  value={form.email}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Password
                </label>
                <input
                  className="input-shell"
                  name="password"
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  type="password"
                  value={form.password}
                />
              </div>

              {error ? (
                <div className="rounded-[20px] border border-rose-300/20 bg-rose-300/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <button className="button-primary w-full" disabled={loading} type="submit">
                <ArrowRight size={18} />
                {loading
                  ? "Processing..."
                  : mode === "login"
                    ? "Enter dashboard"
                    : "Create account"}
              </button>
            </form>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Want to test fallback mode?
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Fill the known ReqRes demo credentials for {mode}.
                  </p>
                </div>
                <button
                  className="button-secondary !rounded-full !px-4 !py-2"
                  onClick={fillDemo}
                  type="button"
                >
                  Use demo creds
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
