"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, token: null, isLoading: true });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    if (token && userJson) {
      try {
        setState({ user: JSON.parse(userJson), token, isLoading: false });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setState({ user: null, token: null, isLoading: false });
      }
    } else {
      setState({ user: null, token: null, isLoading: false });
    }
  }, []);

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setState({ user, token, isLoading: false });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setState({ user: null, token: null, isLoading: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
