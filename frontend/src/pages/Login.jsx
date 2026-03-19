import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { AuthContext } from "../context/AuthContext";

const SAMPLE_PARTICIPANTS = ["Rohit", "Meera", "Arjun", "You"];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const participantPreview = useMemo(
    () =>
      SAMPLE_PARTICIPANTS.map((name) =>
        name
          .split(" ")
          .map((word) => word[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()
      ),
    []
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (error) {
      setErrorMessage(
        "Unable to reach the backend right now. You can still open the demo workspace."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoEntry = () => {
    login("demo-token", {
      id: "demo-user",
      name: "Demo User",
      email: "demo@batchit.app",
      role: "student",
    });
    navigate("/dashboard");
  };

  return (
    <div className="auth-page">
      <section className="auth-shell">
        <div className="auth-hero">
          <span className="live-pill">Realtime ordering</span>
          <p className="eyebrow">Shared session product</p>
          <h1>Coordinate one order without turning chat into chaos.</h1>
          <p className="auth-lead">
            Create a batch, invite the group, watch items land live, and close the
            order with confidence before the timer runs out.
          </p>

          <div className="auth-feature-grid">
            <article className="auth-feature">
              <strong>Live activity feed</strong>
              <span>See who joined, what was added, and when decisions changed.</span>
            </article>
            <article className="auth-feature">
              <strong>Shared cart clarity</strong>
              <span>Every item stays tagged to a person so the split stays obvious.</span>
            </article>
            <article className="auth-feature">
              <strong>Urgency without clutter</strong>
              <span>Timers and close controls keep the batch moving cleanly.</span>
            </article>
          </div>

          <div className="auth-presence">
            <div className="presence-stack" aria-hidden="true">
              {participantPreview.map((initials, index) => (
                <span
                  key={initials}
                  className="presence-avatar"
                  style={{
                    "--avatar-accent": ["#FF8A3D", "#5D8BFF", "#21B87C", "#F25F7A"][
                      index
                    ],
                  }}
                >
                  {initials}
                </span>
              ))}
            </div>
            <p>Built for teams, hostels, offices, and any group that orders together.</p>
          </div>
        </div>

        <form className="auth-card" onSubmit={handleLogin}>
          <div className="auth-card-copy">
            <p className="eyebrow">Welcome back</p>
            <h2>Enter your workspace</h2>
            <span>Sign in to create or join a live ordering batch.</span>
          </div>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              placeholder="team@batchit.app"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {errorMessage ? <p className="form-message">{errorMessage}</p> : null}

          <div className="auth-actions">
            <button type="submit" className="primary-button" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
            <button
              type="button"
              className="ghost-button"
              onClick={handleDemoEntry}
            >
              Open Demo Workspace
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
