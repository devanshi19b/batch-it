import { api, canFallbackToDemo } from "./api";

const mapBackendAuth = (data) => ({
  token: data.data.token,
  user: data.data.user,
  provider: "backend",
  message: data.message,
});

const createDemoToken = (payload) =>
  `demo-${btoa(`${payload.email}:${Date.now()}`).replaceAll("=", "")}`;

const mapDemoAuth = (mode, payload) => ({
  token: createDemoToken(payload),
  user: {
    id: `demo-${payload.email}`,
    name: payload.name || "Demo Workspace User",
    email: payload.email,
    role: "demo",
  },
  provider: "demo",
  message:
    mode === "login"
      ? "Signed in with local demo mode because the backend was unavailable."
      : "Registered with local demo mode because the backend was unavailable.",
});

const authenticate = async (mode, payload) => {
  try {
    const { data } = await api.post(`/auth/${mode}`, payload);
    return mapBackendAuth(data);
  } catch (backendError) {
    if (!canFallbackToDemo(backendError) && backendError?.status !== 500) {
      throw backendError;
    }

    return mapDemoAuth(mode, payload);
  }
};

export const login = (payload) => authenticate("login", payload);

export const register = (payload) => authenticate("register", payload);
