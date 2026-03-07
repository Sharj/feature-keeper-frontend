"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicBoard, ApiError } from "@/lib/api";
import { useEndUser } from "@/contexts/EndUserContext";
import EndUserAuthModal from "@/components/public/EndUserAuthModal";
import type { Board, Idea, Status, Category, PaginationMeta } from "@/types";

export default function PublicBoardPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const boardSlug = params.boardSlug as string;
  const { endUserId, name: userName, clearEndUser } = useEndUser();

  const [board, setBoard] = useState<(Board & { auth_mode?: string }) | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [page, setPage] = useState(1);

  // Auth modal
  const [showAuth, setShowAuth] = useState(false);

  // New idea form
  const [showNewIdea, setShowNewIdea] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Load board
  useEffect(() => {
    publicBoard.get(orgSlug, boardSlug).then((res) => {
      setBoard(res.data);
    }).catch(() => setError("Board not found"));
  }, [orgSlug, boardSlug]);

  // Load ideas
  const loadIdeas = useCallback(() => {
    const queryParams: Record<string, string> = { sort, page: String(page), per_page: "20" };
    if (statusFilter) queryParams.status_id = statusFilter;
    if (categoryFilter) queryParams.category_id = categoryFilter;
    if (search) queryParams.q = search;

    publicBoard.ideas(orgSlug, boardSlug, queryParams).then((res) => {
      setIdeas(res.data.ideas || []);
      setMeta(res.data.meta);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [orgSlug, boardSlug, statusFilter, categoryFilter, search, sort, page]);

  useEffect(() => {
    if (board) loadIdeas();
  }, [board, loadIdeas]);

  async function handleVote(ideaId: number) {
    if (!endUserId) {
      setShowAuth(true);
      return;
    }
    try {
      const res = await publicBoard.vote(orgSlug, boardSlug, ideaId, endUserId);
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, votes_count: res.data.votes_count } : i
        )
      );
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setShowAuth(true);
      else setError(err instanceof ApiError ? err.message : "Vote failed");
    }
  }

  async function handleSubmitIdea(e: FormEvent) {
    e.preventDefault();
    if (!endUserId) {
      setShowAuth(true);
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await publicBoard.createIdea(orgSlug, boardSlug, {
        idea: {
          title: newTitle,
          description: newDesc,
          ...(newCategory ? { category_id: Number(newCategory) } : {}),
        },
        end_user_id: endUserId,
      });
      setShowNewIdea(false);
      setNewTitle("");
      setNewDesc("");
      setNewCategory("");
      loadIdeas();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setShowAuth(true);
      else setError(err instanceof ApiError ? err.message : "Failed to submit idea");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">{board?.name || "Loading..."}</h1>
          {board?.description && <p className="text-gray-600 mt-1">{board.description}</p>}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              {endUserId ? (
                <>
                  <span className="text-sm text-gray-600">Signed in as <strong>{userName}</strong></span>
                  <button onClick={clearEndUser} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Sign in to vote & submit ideas
                </button>
              )}
            </div>
            <button
              onClick={() => {
                if (!endUserId) { setShowAuth(true); return; }
                setShowNewIdea(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Submit Idea
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        {/* New Idea Form */}
        {showNewIdea && (
          <form onSubmit={handleSubmitIdea} className="mb-6 p-5 bg-white rounded-xl border border-gray-200 space-y-3">
            <h3 className="font-semibold">Submit a New Idea</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                required
                maxLength={255}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your idea title..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                maxLength={10000}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
                placeholder="Describe your idea..."
              />
            </div>
            {board?.categories && board.categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-1">Category (optional)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">No category</option>
                  {board.categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button type="button" onClick={() => setShowNewIdea(false)} className="px-4 py-2 text-gray-600 text-sm">Cancel</button>
            </div>
          </form>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <input
            type="text"
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {board?.statuses?.map((s: Status) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {board?.categories?.map((c: Category) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="recent">Most Recent</option>
            <option value="votes">Most Votes</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>

        {/* Ideas List */}
        {loading ? (
          <p className="text-gray-500 text-center py-8">Loading ideas...</p>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-500 mb-1">No ideas yet.</p>
            <p className="text-sm text-gray-400">Be the first to submit one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ideas.map((idea) => (
              <div key={idea.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:border-gray-300 transition">
                {/* Vote button */}
                <button
                  onClick={() => handleVote(idea.id)}
                  className="flex flex-col items-center justify-center w-14 shrink-0 py-2 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition"
                >
                  <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-700">{idea.votes_count}</span>
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/o/${orgSlug}/b/${boardSlug}/ideas/${idea.id}`}
                    className="font-semibold text-gray-900 hover:text-indigo-600 transition"
                  >
                    {idea.title}
                  </Link>
                  {idea.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{idea.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {idea.status && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: idea.status.color + "20", color: idea.status.color }}
                      >
                        {idea.status.name}
                      </span>
                    )}
                    {idea.category && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: idea.category.color + "20", color: idea.category.color }}
                      >
                        {idea.category.name}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">
                      {idea.comments_count} comment{idea.comments_count !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-gray-400">&middot;</span>
                    <span className="text-xs text-gray-400">{idea.author.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-600">
              Page {meta.page} of {meta.total_pages}
            </span>
            <button
              disabled={page >= meta.total_pages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <EndUserAuthModal
        orgSlug={orgSlug}
        authMode={board?.auth_mode || "email_only"}
        open={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
}
