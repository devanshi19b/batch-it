import axios from "axios";
import { clearSession, readStoredToken } from "../utils/session";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5050/api";
export const BACKEND_URL = API_BASE_URL.replace(/\/api\/?$/, "");

let unauthorizedHandler = null;

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = readStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();

      if (typeof unauthorizedHandler === "function") {
        unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  }
);

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.message || fallback;
}

export default api;
