"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { project as projectApi } from "@/lib/api";
import { Button, Avatar } from "@/components/ui";
import type { Project } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, hasProject, isLoading, logout } = useAuth();
  const router = useRouter();
  const [proj, setProj] = useState<Project | null>(null);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    } else if (!isLoading && token && !hasProject) {
      router.push("/onboarding");
    }
  }, [isLoading, token, hasProject, router]);

  useEffect(() => {
    if (token && hasProject) {
      projectApi.get(token).then((res) => setProj(res.data)).catch(() => {});
    }
  }, [token, hasProject]);

  if (isLoading || !token || !hasProject) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <nav className="sticky top-0 z-40 bg-nav">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex justify-between h-14 items-center">
            <Link href="/dashboard" className="text-lg font-serif text-cream">
              Feature Keeper
            </Link>
            <div className="flex items-center gap-1 ml-6">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm" className="!text-cream/70 hover:!text-cream hover:!bg-white/10">
                  Ideas
                </Button>
              </Link>
              <Link href="/dashboard/updates">
                <Button variant="ghost" size="sm" className="!text-cream/70 hover:!text-cream hover:!bg-white/10">
                  Updates
                </Button>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/settings">
                <Button
                  variant="ghost"
                  size="sm"
                  className="!text-cream/70 hover:!text-cream hover:!bg-white/10"
                >
                  Settings
                </Button>
              </Link>
              {proj?.slug && (
                <a
                  href={`/${proj.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="!text-cream/70 hover:!text-cream hover:!bg-white/10"
                  >
                    Public Board &#8599;
                  </Button>
                </a>
              )}
              {user && <Avatar name={user.name} size="sm" />}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="!text-cream/70 hover:!text-cream hover:!bg-white/10"
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-5xl mx-auto px-6 py-8 flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-edge mt-auto">
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <span className="text-sm font-serif text-muted">Feature Keeper</span>
              {proj?.plan && (
                <span className="text-xs text-faint bg-cream px-2 py-0.5 rounded-full">
                  {proj.plan.name} plan
                </span>
              )}
            </div>
            <div className="flex items-center gap-5 text-xs text-muted">
              <a href="mailto:support@featurekeeper.com" className="hover:text-subtle transition-colors">Support</a>
              <span className="text-faint">|</span>
              <span>&copy; {new Date().getFullYear()} Feature Keeper</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
