"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

interface EndUserState {
  endUserId: number | null;
  name: string | null;
  email: string | null;
}

interface EndUserContextType extends EndUserState {
  setEndUser: (data: { end_user_id: number; name: string; email: string }) => void;
  clearEndUser: () => void;
  storageKey: string;
}

const EndUserContext = createContext<EndUserContextType | null>(null);

export function EndUserProvider({ orgSlug, boardSlug, children }: { orgSlug: string; boardSlug: string; children: ReactNode }) {
  const storageKey = `enduser_${orgSlug}_${boardSlug}`;
  const [state, setState] = useState<EndUserState>({ endUserId: null, name: null, email: null });

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setState({ endUserId: data.end_user_id, name: data.name, email: data.email });
      } catch {
        localStorage.removeItem(storageKey);
      }
    }
  }, [storageKey]);

  const setEndUser = useCallback((data: { end_user_id: number; name: string; email: string }) => {
    localStorage.setItem(storageKey, JSON.stringify(data));
    setState({ endUserId: data.end_user_id, name: data.name, email: data.email });
  }, [storageKey]);

  const clearEndUser = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState({ endUserId: null, name: null, email: null });
  }, [storageKey]);

  return (
    <EndUserContext.Provider value={{ ...state, setEndUser, clearEndUser, storageKey }}>
      {children}
    </EndUserContext.Provider>
  );
}

export function useEndUser() {
  const ctx = useContext(EndUserContext);
  if (!ctx) throw new Error("useEndUser must be used within EndUserProvider");
  return ctx;
}
