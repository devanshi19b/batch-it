import axios from "axios";
import { api, canFallbackToDemo, extractErrorMessage } from "./api";

const reqresClient = axios.create({
  baseURL: "https://reqres.in/api",
  timeout: 10000,
});

const reqresHeaders = import.meta.env.VITE_REQRES_API_KEY
  ? { "x-api-key": import.meta.env.VITE_REQRES_API_KEY }
  : {};

const mapBackendAuth = (data) => ({
  token: data.data.token,
  user: data.data.user,
  provider: "backend",
  message: data.message,
});

const mapReqresAuth = (mode, payload, data) => ({
  token: data.token,
  user: {
    id: data.id || `reqres-${payload.email}`,
    name: payload.name || "Demo Workspace User",
    email: payload.email,
    role: "demo",
  },
  provider: "reqres",
  message:
    mode === "login"
      ? "Signed in with ReqRes fallback mode."
      : "Registered with ReqRes fallback mode.",
});

const getReqresHint = (mode) =>
  mode === "login"
    ? "Use eve.holt@reqres.in with password cityslicka for the demo fallback."
    : "Use eve.holt@reqres.in with password pistol for the demo fallback.";

const authenticate = async (mode, payload) => {
  try {
    const { data } = await api.post(`/auth/${mode}`, payload);
    return mapBackendAuth(data);
  } catch (backendError) {
    if (!canFallbackToDemo(backendError) && backendError?.status !== 500) {
      throw backendError;
    }

    try {
      const { data } = await reqresClient.post(
        `/${mode}`,
        {
          email: payload.email,
          password: payload.password,
        },
        { headers: reqresHeaders }
      );

      return mapReqresAuth(mode, payload, data);
    } catch (reqresError) {
      const wrappedError = new Error(
        `${extractErrorMessage(reqresError, "Unable to authenticate.")} ${getReqresHint(mode)}`
      );
      wrappedError.userMessage = wrappedError.message;
      throw wrappedError;
    }
  }
};

export const login = (payload) => authenticate("login", payload);

export const register = (payload) => authenticate("register", payload);
