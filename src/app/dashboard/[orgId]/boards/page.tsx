"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { boards, organizations, ApiError } from "@/lib/api";
import type { Board, Organization } from "@/types";

export default function BoardsPage() {
  const { token } = useAuth();
  const params = useParams();
  const orgId = Number(params.orgId);

  const [org, setOrg] = useState<Organization | null>(null);
  const [boardList, setBoardList] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      organizations.get(token, orgId),
      boards.list(token, orgId),
    ]).then(([orgRes, boardsRes]) => {
      setOrg(orgRes.data);
      setBoardList(Array.isArray(boardsRes.data) ? boardsRes.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, orgId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError("");
    try {
      const slug = newSlug || newName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const res = await boards.create(token, orgId, {
        board: { name: newName, slug, description: newDesc },
      });
      setBoardList((prev) => [...prev, res.data]);
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      setNewDesc("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create board");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/dashboard/${orgId}`} className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold">{org?.name || "..."}</h1>
      </div>

      {/* Nav */}
      <div className="flex gap-4 border-b border-gray-200 pb-2 mb-6">
        <Link href={`/dashboard/${orgId}`} className="text-sm text-gray-500 hover:text-gray-700 pb-2">Settings</Link>
        <span className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-2">Boards</span>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Boards</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
        >
          New Board
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {showCreate && (
        <form onSubmit={handleCreate} className="mb-6 p-4 bg-white rounded-xl border border-gray-200 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Feature Requests"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="feature-requests (auto)"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
              placeholder="Share your feature ideas..."
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={creating} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
              {creating ? "Creating..." : "Create Board"}
            </button>
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-gray-600 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Loading boards...</p>
      ) : boardList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-2">No boards yet.</p>
          <p className="text-sm text-gray-400">Create a board to start collecting feedback.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boardList.map((board) => (
            <Link
              key={board.id}
              href={`/dashboard/${orgId}/boards/${board.id}`}
              className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-sm transition"
            >
              <h3 className="font-semibold">{board.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{board.description}</p>
              <p className="text-xs text-gray-400 mt-2">{board.ideas_count} ideas</p>
              {org && (
                <p className="text-xs text-indigo-500 mt-1">/o/{org.slug}/b/{board.slug}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
