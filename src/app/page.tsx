"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">Feature Keeper</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition px-4 py-2">
              Sign in
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
            Now in public beta
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Turn user feedback into<br />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              your product roadmap
            </span>
          </h1>
          <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Give your users a voice. Collect feature requests, let them vote on what matters most, and keep everyone in the loop as you ship.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-semibold text-base hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 hover:shadow-indigo-300"
            >
              Start collecting feedback
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-gray-700 rounded-xl font-semibold text-base border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition"
            >
              Sign in to dashboard
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-400">Free to start. No credit card required.</p>
        </div>
      </section>

      {/* Board Preview */}
      <section className="px-6 pb-20">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-950 rounded-2xl p-1.5 shadow-2xl shadow-gray-300/50">
            <div className="bg-white rounded-xl overflow-hidden">
              {/* Fake browser chrome */}
              <div className="bg-gray-50 border-b border-gray-200 px-4 py-2.5 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="bg-white border border-gray-200 rounded-md px-4 py-1 text-xs text-gray-400 w-72 text-center">
                    yourapp.featurekeeper.io/board
                  </div>
                </div>
              </div>
              {/* Mock board content */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="h-5 w-40 bg-gray-900 rounded" />
                    <div className="h-3 w-64 bg-gray-200 rounded mt-2" />
                  </div>
                  <div className="h-9 w-28 bg-indigo-600 rounded-lg" />
                </div>
                {[
                  { title: "Dark mode support", votes: 47, status: "Planned", statusColor: "#8b5cf6", category: "UI/UX" },
                  { title: "CSV export for reports", votes: 32, status: "Under Review", statusColor: "#f59e0b", category: "Analytics" },
                  { title: "Slack integration", votes: 28, status: "In Progress", statusColor: "#3b82f6", category: "Integrations" },
                  { title: "Custom email templates", votes: 19, status: "Open", statusColor: "#6b7280", category: "Email" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition">
                    <div className="flex flex-col items-center justify-center w-12 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                      <span className="text-sm font-bold text-gray-700">{item.votes}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800">{item.title}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: item.statusColor + "18", color: item.statusColor }}>{item.status}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{item.category}</span>
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
      <section className="px-6 py-20 bg-gray-50" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Everything you need to close the feedback loop</h2>
            <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">From collecting ideas to shipping features, Feature Keeper keeps your team aligned with what users actually want.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
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
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all duration-200">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Up and running in minutes</h2>
          <div className="grid sm:grid-cols-3 gap-12">
            {[
              { step: "01", title: "Create your board", description: "Sign up, name your organization, and create a feedback board. Share the public link with your users." },
              { step: "02", title: "Collect & prioritize", description: "Users submit ideas and vote. You see what matters most, organized by status and category." },
              { step: "03", title: "Ship & communicate", description: "Update statuses as you build. Users stay in the loop without you writing a single changelog." },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-extrabold text-indigo-100 mb-3">{item.step}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto text-center bg-gradient-to-br from-indigo-600 to-violet-600 rounded-3xl p-12 sm:p-16 shadow-xl shadow-indigo-200">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Start building what users want</h2>
          <p className="mt-4 text-indigo-100 text-lg max-w-lg mx-auto">
            Stop guessing. Let your community tell you what to build next.
          </p>
          <Link
            href="/register"
            className="inline-block mt-8 px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold text-base hover:bg-indigo-50 transition shadow-lg"
          >
            Get started for free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-5 h-5 bg-indigo-600 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            Feature Keeper
          </div>
          <p className="text-sm text-gray-400">Built for teams that listen to their users.</p>
        </div>
      </footer>
    </div>
  );
}
