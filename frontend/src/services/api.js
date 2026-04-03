import axios from "axios";

const STORAGE_KEY = "batch-it.session";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";

export const API_ORIGIN = (() => {
  try {
    const url = new URL(API_BASE_URL);
    return url.origin;
  } catch {
    // Relative path (e.g. "/api") — use the current browser origin
    // so the Vite dev proxy handles the request
    if (typeof window !== "undefined") {
      return window.location.origin;
    }

    return "http://localhost:5050";
  }
})();

const readToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?.token ?? null;
  } catch {
    return null;
  }
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = readToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const normalizedError = error;

    if (!normalizedError.response) {
      normalizedError.isUnavailable = true;
      normalizedError.userMessage =
        "Batch-It backend is currently unreachable. Demo mode can take over.";
      return Promise.reject(normalizedError);
    }

    normalizedError.status = normalizedError.response.status;
    normalizedError.isUnavailable = normalizedError.response.status >= 500;
    normalizedError.userMessage =
      normalizedError.response.data?.message ||
      normalizedError.message ||
      "Something went wrong.";

    return Promise.reject(normalizedError);
  }
);

export const extractErrorMessage = (
  error,
  fallback = "Something went wrong."
) =>
  error?.userMessage ||
  error?.response?.data?.message ||
  error?.message ||
  fallback;

export const canFallbackToDemo = (error) =>
  Boolean(error?.isUnavailable || !error?.response);
