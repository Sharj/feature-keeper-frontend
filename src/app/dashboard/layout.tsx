"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { project as projectApi } from "@/lib/api";
import { Avatar } from "@/components/ui";
import type { Project } from "@/types";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, token, hasProject, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [proj, setProj] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

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

  const navLinks = [
    { href: "/dashboard", label: "Ideas" },
    { href: "/dashboard/updates", label: "Updates" },
    { href: "/dashboard/settings", label: "Settings", match: "/dashboard/settings" },
  ];

  function isActive(href: string, match?: string) {
    if (match) return pathname.startsWith(match);
    return pathname === href;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <nav className="sticky top-0 z-40 bg-nav">
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="flex items-center h-14 gap-8">
            {/* Brand */}
            <Link href="/dashboard" className="text-lg font-serif text-cream shrink-0">
              Feature Keeper
            </Link>

            {/* Main nav */}
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    isActive(link.href, link.match)
                      ? "text-cream bg-white/10 font-medium"
                      : "text-cream/60 hover:text-cream hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* View Site link */}
              {proj?.slug && (
                <a
                  href={`/${proj.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cream/60 hover:text-cream transition-colors flex items-center gap-1.5"
                >
                  View Site
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              )}

              {/* Avatar + dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 cursor-pointer rounded-full hover:bg-white/10 transition-colors p-0.5 pr-2"
                >
                  {user && <Avatar name={user.name} size="sm" />}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cream/50">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-surface border border-edge rounded-xl shadow-lg py-1 animate-scale-in z-50">
                    <div className="px-3 py-2 border-b border-edge">
                      <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                      <p className="text-xs text-muted truncate">{user?.email}</p>
                    </div>
                    {proj?.plan && (
                      <div className="px-3 py-2 border-b border-edge">
                        <span className="text-xs text-muted">{proj.plan.name} plan</span>
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-subtle hover:bg-cream hover:text-ink transition-colors cursor-pointer"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full max-w-6xl mx-auto px-6 py-8 flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-edge mt-auto">
        <div className="w-full max-w-6xl mx-auto px-6 py-5">
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
