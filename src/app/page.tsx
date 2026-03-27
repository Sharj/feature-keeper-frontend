import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* ─── Nav ─── */}
      <nav className="fixed top-0 w-full bg-nav/95 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-lg font-semibold text-white font-serif tracking-tight">
            Feature Keeper
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition px-4 py-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-accent text-white px-5 py-2 rounded-lg hover:bg-accent-bold transition shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="bg-nav pt-36 pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.08]">
            Know what your users
            <br />
            <span className="text-accent">actually want.</span>
          </h1>
          <p
            className="mt-7 text-lg sm:text-xl text-white/55 max-w-2xl mx-auto leading-relaxed animate-fade-in"
            style={{ animationDelay: "120ms" }}
          >
            A public feedback board where your customers submit ideas, vote on
            what matters, and watch your product evolve — while you focus on
            building the right things.
          </p>
          <div
            className="mt-10 animate-fade-in"
            style={{ animationDelay: "240ms" }}
          >
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 bg-accent text-white rounded-xl font-semibold text-base hover:bg-accent-bold transition shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50"
            >
              Start collecting feedback — free
            </Link>
          </div>
        </div>

        {/* ─── Board Preview Mockup ─── */}
        <div
          className="max-w-5xl mx-auto mt-16 animate-slide-up"
          style={{ animationDelay: "350ms" }}
        >
          <div className="bg-edge/20 rounded-2xl p-1 shadow-2xl shadow-black/30">
            <div className="bg-surface rounded-xl overflow-hidden">
              {/* Browser chrome */}
              <div className="bg-cream border-b border-edge px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-surface border border-edge rounded-md px-4 py-1 text-xs text-muted w-64 text-center">
                    acme.featurekeeper.com
                  </div>
                </div>
              </div>

              {/* Board layout: sidebar + ideas list */}
              <div className="flex min-h-[340px]">
                {/* Sidebar */}
                <div className="w-52 shrink-0 border-r border-edge bg-cream/60 p-4 hidden sm:block">
                  <div className="font-serif font-semibold text-sm text-ink mb-4">
                    Acme Co
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-accent-soft text-accent text-xs font-medium">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
                      All Ideas
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-subtle text-xs hover:bg-cream">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" /></svg>
                      Trending
                    </div>
                    <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-subtle text-xs hover:bg-cream">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Roadmap
                    </div>
                  </div>
                  <div className="mt-6 text-[10px] uppercase tracking-wider text-muted font-semibold mb-2">
                    Topics
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs text-subtle">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      Integrations
                    </div>
                    <div className="flex items-center gap-2 text-xs text-subtle">
                      <span className="w-2 h-2 rounded-full bg-purple-500" />
                      UI / UX
                    </div>
                    <div className="flex items-center gap-2 text-xs text-subtle">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Performance
                    </div>
                    <div className="flex items-center gap-2 text-xs text-subtle">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      Billing
                    </div>
                  </div>
                </div>

                {/* Ideas list */}
                <div className="flex-1 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif font-semibold text-sm text-ink">
                      Feature Requests
                    </h3>
                    <div className="h-7 px-3 bg-accent rounded-md flex items-center">
                      <span className="text-white text-xs font-medium">
                        + New Idea
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      {
                        title: "Dark mode support",
                        votes: 47,
                        tag: "UI / UX",
                        tagColor: "#8b5cf6",
                        status: "Planned",
                        statusColor: "#8b5cf6",
                        comments: 12,
                      },
                      {
                        title: "Slack notifications for new votes",
                        votes: 34,
                        tag: "Integrations",
                        tagColor: "#3b82f6",
                        status: "In Progress",
                        statusColor: "#3b82f6",
                        comments: 8,
                      },
                      {
                        title: "Faster dashboard load times",
                        votes: 28,
                        tag: "Performance",
                        tagColor: "#10b981",
                        status: "Under Review",
                        statusColor: "#f59e0b",
                        comments: 5,
                      },
                      {
                        title: "Annual billing discount",
                        votes: 19,
                        tag: "Billing",
                        tagColor: "#f59e0b",
                        status: "Open",
                        statusColor: "#9c968f",
                        comments: 3,
                      },
                      {
                        title: "CSV export for analytics",
                        votes: 14,
                        tag: "Integrations",
                        tagColor: "#3b82f6",
                        status: "Open",
                        statusColor: "#9c968f",
                        comments: 2,
                      },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3.5 p-3 rounded-lg border border-edge hover:border-edge-strong transition group"
                      >
                        <div className="flex flex-col items-center justify-center w-11 py-1 rounded-lg bg-cream border border-edge group-hover:border-accent/30 transition">
                          <svg
                            className="w-3 h-3 text-muted group-hover:text-accent transition"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                          <span className="text-xs font-bold text-ink leading-tight">
                            {item.votes}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-ink truncate">
                            {item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{
                                backgroundColor: item.tagColor + "15",
                                color: item.tagColor,
                              }}
                            >
                              {item.tag}
                            </span>
                            <span
                              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                              style={{
                                backgroundColor: item.statusColor + "18",
                                color: item.statusColor,
                              }}
                            >
                              {item.status}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-muted">
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                            />
                          </svg>
                          <span className="text-[10px] font-medium">
                            {item.comments}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="px-6 py-28">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif text-ink">
              Everything to close the feedback loop
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Topic tags",
                description:
                  "Organize ideas with colored tags so nothing gets lost in the noise.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 6h.008v.008H6V6z"
                    />
                  </svg>
                ),
              },
              {
                title: "Upvoting",
                description:
                  "Users vote on ideas that matter. You see demand at a glance.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z"
                    />
                  </svg>
                ),
              },
              {
                title: "Public roadmap",
                description:
                  "Show progress transparently. Build trust with every status update.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ),
              },
              {
                title: "Instant setup",
                description:
                  "Sign up, describe your product, and your board is live in 60 seconds.",
                icon: (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
                    />
                  </svg>
                ),
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="animate-slide-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-10 h-10 bg-accent-soft rounded-xl flex items-center justify-center text-accent mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-ink font-serif mb-1.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-subtle leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="px-6 py-24 bg-surface border-y border-edge">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif text-center text-ink mb-16">
            Three steps. That&apos;s it.
          </h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Sign up",
                description:
                  "Create your account and tell us about your product.",
              },
              {
                step: "2",
                title: "Set up your project",
                description:
                  "Name your board, pick a slug, and customize your topics.",
              },
              {
                step: "3",
                title: "Share the link",
                description:
                  "Your board is live. Send the URL to your users and start collecting feedback.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${i * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-white font-serif font-bold text-lg mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-ink font-serif mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-subtle leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="px-6 py-28">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-serif text-ink">
              Simple pricing
            </h2>
            <p className="mt-4 text-subtle text-lg">
              Start free, upgrade when you need more.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {/* Free */}
            <div className="animate-slide-up">
              <div className="bg-surface border border-edge rounded-xl p-6 h-full flex flex-col">
                <div className="flex-1">
                  <h3 className="text-xl font-serif text-ink font-semibold">Free</h3>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    $0<span className="text-sm font-normal text-muted">/month</span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {["Up to 5 ideas", "Public feedback board", "Roadmap view", "Updates / Changelog"].map(
                      (f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-subtle">
                          <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          {f}
                        </li>
                      )
                    )}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="block text-center px-5 py-2.5 text-base font-medium rounded-lg bg-surface text-ink border border-edge hover:border-edge-strong hover:bg-cream shadow-xs transition-all duration-150"
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>

            {/* Pro */}
            <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
              <div className="bg-surface border border-edge rounded-xl p-6 h-full flex flex-col ring-2 ring-accent">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif text-ink font-semibold">Pro</h3>
                    <span className="text-[10px] uppercase tracking-wider font-semibold bg-accent text-white px-2 py-0.5 rounded-full">
                      Popular
                    </span>
                  </div>
                  <p className="mt-1 text-2xl font-bold text-ink">
                    $0<span className="text-sm font-normal text-muted">/month during beta</span>
                  </p>
                  <ul className="mt-5 space-y-2.5">
                    {[
                      "Unlimited ideas",
                      "Everything in Free",
                      "Custom domain",
                      "Remove branding",
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-subtle">
                        <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-8">
                  <Link
                    href="/register"
                    className="block text-center px-5 py-2.5 text-base font-medium rounded-lg bg-accent text-white hover:bg-accent-bold shadow-sm hover:shadow-md transition-all duration-150"
                  >
                    Start with Pro
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-nav px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-serif text-white animate-fade-in">
            Start building what matters.
          </h2>
          <p
            className="mt-5 text-white/50 text-lg max-w-md mx-auto animate-fade-in"
            style={{ animationDelay: "100ms" }}
          >
            Stop guessing. Let your users tell you what to build next.
          </p>
          <div
            className="mt-10 animate-fade-in"
            style={{ animationDelay: "200ms" }}
          >
            <Link
              href="/register"
              className="inline-block px-8 py-3.5 bg-accent text-white rounded-xl font-semibold text-base hover:bg-accent-bold transition shadow-lg shadow-orange-900/30"
            >
              Get started for free
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-edge px-6 py-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm font-semibold text-ink font-serif">
            Feature Keeper
          </span>
          <div className="flex items-center gap-6">
            <Link
              href="/login"
              className="text-sm text-subtle hover:text-ink transition"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="text-sm text-subtle hover:text-ink transition"
            >
              Get Started
            </Link>
          </div>
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} Feature Keeper
          </p>
        </div>
      </footer>
    </div>
  );
}
