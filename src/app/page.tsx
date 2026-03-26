"use client";

import Link from "next/link";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-cream">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-nav/95 backdrop-blur-md z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-semibold text-white font-serif">Feature Keeper</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/70 hover:text-white transition px-4 py-2">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent-bold transition shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — dark bg */}
      <section className="bg-nav pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm font-medium mb-8">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Now in public beta
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif text-white tracking-tight leading-[1.1]">
            Turn user feedback into{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              your product roadmap
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed animate-fade-in" style={{ animationDelay: "150ms" }}>
            Give your users a voice. Collect feature requests, let them vote on what matters most, and keep everyone in the loop as you ship.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-accent text-white rounded-xl font-semibold text-base hover:bg-accent-bold transition shadow-lg shadow-orange-900/30 hover:shadow-orange-900/50"
            >
              Start collecting feedback
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-base border border-white/15 hover:bg-white/15 transition"
            >
              Sign in to dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-white/40 animate-fade-in" style={{ animationDelay: "400ms" }}>Free to start. No credit card required.</p>
        </div>
      </section>

      {/* Board Preview */}
      <section className="px-6 -mt-12 pb-20 relative z-10">
        <div className="max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="bg-nav rounded-2xl p-1.5 shadow-2xl shadow-black/20">
            <div className="bg-surface rounded-xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="bg-cream border-b border-edge px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-surface border border-edge rounded-md px-4 py-1 text-xs text-muted w-72 text-center">
                    yourapp.featurekeeper.io/board
                  </div>
                </div>
              </div>
              {/* Mock board content */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="h-5 w-40 bg-ink rounded" />
                    <div className="h-3 w-64 bg-edge rounded mt-2" />
                  </div>
                  <div className="h-9 w-28 bg-accent rounded-lg" />
                </div>
                {[
                  { title: "Dark mode support", votes: 47, status: "Planned", statusColor: "#8b5cf6", category: "UI/UX" },
                  { title: "CSV export for reports", votes: 32, status: "Under Review", statusColor: "#f59e0b", category: "Analytics" },
                  { title: "Slack integration", votes: 28, status: "In Progress", statusColor: "#3b82f6", category: "Integrations" },
                  { title: "Custom email templates", votes: 19, status: "Open", statusColor: "#6b7280", category: "Email" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-edge hover:border-edge-strong transition">
                    <div className="flex flex-col items-center justify-center w-12 py-1.5 rounded-lg bg-cream border border-edge">
                      <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      <span className="text-sm font-bold text-ink">{item.votes}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink">{item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: item.statusColor + "18", color: item.statusColor }}>{item.status}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-cream text-subtle">{item.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="px-6 py-24" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif text-ink">Everything you need to close the feedback loop</h2>
            <p className="mt-4 text-lg text-subtle max-w-2xl mx-auto">From collecting ideas to shipping features, Feature Keeper keeps your team aligned with what users actually want.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                ),
                title: "Public feedback boards",
                description: "Create branded boards where users submit ideas, upvote features, and see your product roadmap evolve.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904M14.25 9h2.25M5.904 18.75c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 01-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 10.203 4.167 9.75 5 9.75h1.053c.472 0 .745.556.5.96a8.958 8.958 0 00-1.302 4.665c0 1.194.232 2.333.654 3.375z" />
                  </svg>
                ),
                title: "Voting & prioritization",
                description: "Let your users vote on what matters. See at a glance which features have the highest demand.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                  </svg>
                ),
                title: "Threaded comments",
                description: "Engage in meaningful conversations. Admin responses are visually distinguished so updates are clear.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                ),
                title: "Statuses & categories",
                description: "Organize feedback with custom statuses and categories. Keep your board tidy and your roadmap transparent.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                  </svg>
                ),
                title: "Team collaboration",
                description: "Invite your team with role-based access. Owners, admins, and members each get the right level of control.",
              },
              {
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                ),
                title: "Flexible authentication",
                description: "Email verification for public users, SSO for enterprise. JWT-based admin auth keeps everything secure.",
              },
            ].map((feature, i) => (
              <Card key={i} variant="interactive" padding="lg" className="group">
                <div className="w-11 h-11 bg-accent-soft rounded-xl flex items-center justify-center text-accent mb-4 group-hover:bg-accent group-hover:text-white transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-ink mb-2">{feature.title}</h3>
                <p className="text-sm text-subtle leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-24 bg-surface border-y border-edge">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-serif text-center text-ink mb-16">Up and running in minutes</h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Create your board", description: "Sign up, name your organization, and create a feedback board. Share the public link with your users." },
              { step: "02", title: "Collect & prioritize", description: "Users submit ideas and vote. You see what matters most, organized by status and category." },
              { step: "03", title: "Ship & communicate", description: "Update statuses as you build. Users stay in the loop without you writing a single changelog." },
            ].map((item, i) => (
              <div key={i} className="text-center animate-fade-in" style={{ animationDelay: `${i * 150}ms` }}>
                <div className="text-5xl font-serif font-bold text-accent/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-ink mb-2">{item.title}</h3>
                <p className="text-sm text-subtle leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-24">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-serif text-ink">Simple, transparent pricing</h2>
            <p className="mt-4 text-lg text-subtle">Start free and scale as your community grows.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Free",
                price: "$0",
                period: "forever",
                description: "For individuals and side projects",
                features: ["1 board", "50 feature requests", "Community voting", "Basic statuses"],
                cta: "Get started",
                highlighted: false,
              },
              {
                name: "Starter",
                price: "$19",
                period: "/month",
                description: "For small teams getting organized",
                features: ["3 boards", "Unlimited requests", "Custom statuses", "Team members (3)", "Email notifications"],
                cta: "Start free trial",
                highlighted: false,
              },
              {
                name: "Pro",
                price: "$49",
                period: "/month",
                description: "For growing products with active users",
                features: ["Unlimited boards", "Unlimited requests", "Custom branding", "Team members (10)", "Priority support", "API access"],
                cta: "Start free trial",
                highlighted: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For organizations at scale",
                features: ["Everything in Pro", "SSO / SAML", "Unlimited team", "Dedicated support", "SLA guarantee", "Custom integrations"],
                cta: "Contact sales",
                highlighted: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`rounded-xl p-6 flex flex-col ${
                  plan.highlighted
                    ? "bg-nav text-white ring-2 ring-accent shadow-xl scale-[1.02]"
                    : "bg-surface border border-edge"
                }`}
              >
                <h3 className={`text-sm font-semibold uppercase tracking-wider ${plan.highlighted ? "text-accent" : "text-accent"}`}>
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className={`text-3xl font-serif font-bold ${plan.highlighted ? "text-white" : "text-ink"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ${plan.highlighted ? "text-white/60" : "text-muted"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>
                <p className={`mt-2 text-sm ${plan.highlighted ? "text-white/60" : "text-subtle"}`}>
                  {plan.description}
                </p>
                <ul className="mt-6 space-y-2.5 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <svg className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? "text-accent" : "text-positive"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className={plan.highlighted ? "text-white/80" : "text-subtle"}>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`mt-6 block text-center py-2.5 rounded-lg text-sm font-semibold transition ${
                    plan.highlighted
                      ? "bg-accent text-white hover:bg-accent-bold"
                      : "bg-cream text-ink border border-edge hover:border-edge-strong"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-nav rounded-3xl p-12 sm:p-16 shadow-xl">
          <h2 className="text-3xl sm:text-4xl font-serif text-white">Start building what users want</h2>
          <p className="mt-4 text-white/60 text-lg max-w-lg mx-auto">
            Stop guessing. Let your community tell you what to build next.
          </p>
          <Link
            href="/register"
            className="inline-block mt-8 px-8 py-3.5 bg-accent text-white rounded-xl font-semibold text-base hover:bg-accent-bold transition shadow-lg"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-edge px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 bg-accent rounded flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-ink font-serif">Feature Keeper</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-sm text-subtle hover:text-ink transition">Features</Link>
              <Link href="/login" className="text-sm text-subtle hover:text-ink transition">Sign in</Link>
              <Link href="/register" className="text-sm text-subtle hover:text-ink transition">Get started</Link>
            </div>
            <p className="text-sm text-muted">Built for teams that listen to their users.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
