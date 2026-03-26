import Link from "next/link";

export default function PublicBoardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1">{children}</div>

      {/* Powered by footer */}
      <footer className="border-t border-edge mt-12">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <Link
              href="/"
              className="group flex items-center gap-2 text-muted hover:text-subtle transition-colors"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-faint group-hover:text-accent transition-colors"
              >
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs">
                Powered by{" "}
                <span className="font-semibold group-hover:text-accent transition-colors">
                  Feature Keeper
                </span>
              </span>
            </Link>
            <Link
              href="/register"
              className="text-xs text-muted hover:text-accent transition-colors"
            >
              Collect feedback for your product &rarr;
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
