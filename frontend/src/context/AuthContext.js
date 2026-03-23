import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { setUnauthorizedHandler } from "../services/api";
import {
  clearSession,
  readStoredToken,
  readStoredUser,
  storeSession,
} from "../utils/session";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => readStoredToken());
  const [user, setUser] = useState(() => readStoredUser());

  const login = (nextToken, nextUser) => {
    storeSession(nextToken, nextUser);
    setToken(nextToken);
    setUser(nextUser || null);
  };

  const logout = () => {
    clearSession();
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearSession();
      setToken(null);
      setUser(null);

      if (!window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?reason=session-expired");
      }
    });

    return () => {
      setUnauthorizedHandler(null);
    };
  }, []);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
