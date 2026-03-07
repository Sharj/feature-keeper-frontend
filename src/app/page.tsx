"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold mb-4">Feature Keeper</h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-md">
        A feature request and feedback board for your organization. Collect ideas, vote, and prioritize.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
        >
          Admin Login
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
