import { createContext, createElement, useEffect, useState } from "react";
import * as authService from "../services/authService";

const STORAGE_KEY = "batch-it.session";

export const AuthContext = createContext(null);

const readStoredSession = () => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistSession = (session) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

const clearStoredSession = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
};

export const getStoredSession = readStoredSession;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readStoredSession);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setSession(readStoredSession());
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const applySession = (authResult) => {
    const nextSession = {
      token: authResult.token,
      user: authResult.user,
      provider: authResult.provider,
      loggedInAt: new Date().toISOString(),
    };

    persistSession(nextSession);
    setSession(nextSession);
    return nextSession;
  };

  const login = async (credentials) => {
    setLoading(true);

    try {
      const result = await authService.login(credentials);
      applySession(result);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);

    try {
      const result = await authService.register(payload);
      applySession(result);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearStoredSession();
    setSession(null);
  };

  return createElement(
    AuthContext.Provider,
    {
      value: {
        session,
        user: session?.user ?? null,
        token: session?.token ?? null,
        provider: session?.provider ?? "backend",
        isAuthenticated: Boolean(session?.token),
        isDemoMode: session?.provider === "reqres",
        loading,
        login,
        register,
        logout,
      },
    },
    children
  );
}
