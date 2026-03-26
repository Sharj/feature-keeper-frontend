"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const SECTIONS = [
  {
    href: "/dashboard/settings/general",
    label: "General",
    group: "main",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings/ideas",
    label: "Ideas",
    group: "main",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings/updates",
    label: "Updates",
    group: "main",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings/plan",
    label: "Plan",
    group: "other",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    href: "/dashboard/settings/danger",
    label: "Danger Zone",
    group: "other",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const mainSections = SECTIONS.filter((s) => s.group === "main");
  const otherSections = SECTIONS.filter((s) => s.group === "other");

  return (
    <div className="animate-fade-in">
      <div className="flex gap-8">
        <div className="w-[200px] shrink-0">
          {/* Back link + title in sidebar column */}
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-subtle transition-colors mb-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Ideas
          </Link>
          <h1 className="text-2xl font-serif text-ink mb-6">Settings</h1>

          <nav className="bg-surface border border-edge rounded-xl p-2 sticky top-20">
            <div className="space-y-0.5">
              {mainSections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  pathname === s.href
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-subtle hover:text-ink hover:bg-cream"
                }`}
              >
                {s.icon}
                {s.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-edge my-2" />
          <div className="space-y-0.5">
            {otherSections.map((s) => (
              <Link
                key={s.href}
                href={s.href}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
                  pathname === s.href
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-subtle hover:text-ink hover:bg-cream"
                }`}
              >
                {s.icon}
                {s.label}
              </Link>
            ))}
          </div>
          </nav>
        </div>

        <div className="flex-1 min-w-0 pt-9">{children}</div>
      </div>
    </div>
  );
}
