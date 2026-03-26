"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [isLoading, token, router]);

  if (isLoading || !token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-40 bg-nav">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            <Link href="/dashboard" className="text-lg font-serif text-cream">
              Feature Keeper
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-nav-subtle">{user?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-nav-subtle hover:text-cream hover:bg-white/10"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
