"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { organizations, ApiError } from "@/lib/api";
import type { Organization } from "@/types";

export default function DashboardPage() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    organizations.list(token).then((res) => {
      setOrgs(Array.isArray(res.data) ? res.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError("");
    try {
      const res = await organizations.create(token, {
        organization: { name: newName, slug: newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") },
      });
      setOrgs((prev) => [...prev, res.data]);
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create organization");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organizations</h1>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          New Organization
        </button>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
          {error && <div className="p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Acme Corp"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="acme-corp (auto-generated)"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {creating ? "Creating..." : "Create"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading organizations...</p>
      ) : orgs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-2">No organizations yet.</p>
          <p className="text-sm text-gray-400">Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {orgs.map((org) => (
            <Link
              key={org.id}
              href={`/dashboard/${org.id}`}
              className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <h2 className="font-semibold text-lg">{org.name}</h2>
              <p className="text-sm text-gray-500 mt-1">/{org.slug}</p>
              {org.plan && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">
                  {org.plan.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
