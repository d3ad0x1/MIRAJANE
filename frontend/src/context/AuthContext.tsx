import React, { createContext, useContext, useState } from "react";

type User = {
  username: string;
  role: "admin" | "viewer";
};

type AuthContextValue = {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // временно считаем, что юзер уже залогинен как admin
  const [user, setUser] = useState<User | null>({
    username: "admin",
    role: "admin",
  });

  async function login(username: string, _password: string) {
    // TODO: позже здесь будет реальный запрос к /auth/login
    setUser({ username, role: "admin" });
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return ctx;
}
