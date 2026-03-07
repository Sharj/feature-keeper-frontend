"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <Link href="/dashboard" className="text-lg font-semibold text-indigo-600">
              Feature Keeper
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.name}</span>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
