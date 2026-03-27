"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  hasSubscription: boolean;
  projectCount: number;
  isLoading: boolean;
  login: (user: User, token: string, hasSubscription: boolean, projectCount: number) => void;
  logout: () => void;
  setProjectCount: (n: number) => void;
  setHasSubscription: (val: boolean) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [projectCount, setProjectCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedHasSub = localStorage.getItem("has_subscription");
    const savedCount = localStorage.getItem("project_count");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setHasSubscription(savedHasSub === "true");
      setProjectCount(Number(savedCount) || 0);
    }
    setIsLoading(false);
  }, []);

  const login = (user: User, token: string, hasSubscription: boolean, projectCount: number) => {
    setUser(user);
    setToken(token);
    setHasSubscription(hasSubscription);
    setProjectCount(projectCount);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("has_subscription", String(hasSubscription));
    localStorage.setItem("project_count", String(projectCount));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setHasSubscription(false);
    setProjectCount(0);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("has_subscription");
    localStorage.removeItem("project_count");
  };

  const updateHasSubscription = (val: boolean) => {
    setHasSubscription(val);
    localStorage.setItem("has_subscription", String(val));
  };

  return (
    <AuthContext.Provider value={{ user, token, hasSubscription, projectCount, isLoading, login, logout, setProjectCount, setHasSubscription: updateHasSubscription }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
