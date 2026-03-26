"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  hasProject: boolean;
  isLoading: boolean;
  login: (user: User, token: string, hasProject: boolean) => void;
  logout: () => void;
  setHasProject: (val: boolean) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasProject, setHasProject] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedHasProject = localStorage.getItem("has_project");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setHasProject(savedHasProject === "true");
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string, hasProject: boolean) => {
    setUser(user);
    setToken(token);
    setHasProject(hasProject);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("has_project", String(hasProject));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setHasProject(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("has_project");
  };

  return (
    <AuthContext.Provider value={{ user, token, hasProject, isLoading, login, logout, setHasProject }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
