import { createContext, useState } from "react";

export const AuthContext = createContext();

function loadStoredUser() {
  try {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  // Initialize synchronously from localStorage so a page refresh on a
  // protected route doesn't briefly render as "logged out" before an
  // effect has a chance to restore the session.
  const [user, setUser] = useState(loadStoredUser);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
