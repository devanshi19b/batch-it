import { createContext, useState } from "react";

export const AuthContext = createContext();

function readStoredUser() {
  try {
    const rawValue = localStorage.getItem("user");
    return rawValue ? JSON.parse(rawValue) : null;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(readStoredUser);

  const login = (nextToken, nextUser = null) => {
    localStorage.setItem("token", nextToken);
    setToken(nextToken);

    if (nextUser) {
      localStorage.setItem("user", JSON.stringify(nextUser));
      setUser(nextUser);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
