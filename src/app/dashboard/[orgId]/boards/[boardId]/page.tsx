"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { boards, statuses, categories, adminIdeas, adminComments, publicBoard, ApiError } from "@/lib/api";
import type { Board, Status, Category, Idea, Comment } from "@/types";

export default function BoardAdminPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orgId = Number(params.orgId);
  const boardId = Number(params.boardId);

  const [board, setBoard] = useState<Board | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"statuses" | "categories" | "ideas">("ideas");

  // Status form
  const [statusName, setStatusName] = useState("");
  const [statusColor, setStatusColor] = useState("#6b7280");
  const [editingStatus, setEditingStatus] = useState<Status | null>(null);

  // Category form
  const [catName, setCatName] = useState("");
  const [catColor, setCatColor] = useState("#6b7280");
  const [editingCat, setEditingCat] = useState<Category | null>(null);

  // Idea detail
  const [selectedIdea, setSelectedIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [adminComment, setAdminComment] = useState("");

  useEffect(() => {
    if (!token) return;
    boards.get(token, orgId, boardId).then((res) => {
      setBoard(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, orgId, boardId]);

  // Load ideas when board data is available
  useEffect(() => {
    if (!board) return;
    // We need the org slug to fetch public ideas - get from board or org
    // Use admin endpoint format. For now, fetch ideas via the public endpoint.
    // We'll get the org info first.
    if (!token) return;
    import("@/lib/api").then(({ organizations }) => {
      organizations.get(token, orgId).then((orgRes) => {
        const orgSlug = orgRes.data.slug;
        const boardSlug = board.slug;
        publicBoard.ideas(orgSlug, boardSlug, { per_page: "100" }).then((res) => {
          setIdeas(res.data.ideas || []);
        }).catch(() => {});
      }).catch(() => {});
    });
  }, [board, token, orgId]);

  async function handleCreateStatus(e: FormEvent) {
    e.preventDefault();
    if (!token || !board) return;
    try {
      const res = await statuses.create(token, orgId, boardId, {
        status: { name: statusName, color: statusColor },
      });
      setBoard({ ...board, statuses: [...(board.statuses || []), res.data] });
      setStatusName("");
      setStatusColor("#6b7280");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create status");
    }
  }

  async function handleUpdateStatus(e: FormEvent) {
    e.preventDefault();
    if (!token || !board || !editingStatus) return;
    try {
      const res = await statuses.update(token, orgId, boardId, editingStatus.id, {
        status: { name: statusName, color: statusColor },
      });
      setBoard({
        ...board,
        statuses: board.statuses?.map((s) => (s.id === editingStatus.id ? res.data : s)),
      });
      setEditingStatus(null);
      setStatusName("");
      setStatusColor("#6b7280");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function handleDeleteStatus(id: number) {
    if (!token || !board || !confirm("Delete this status? Ideas with this status will be unassigned.")) return;
    try {
      await statuses.delete(token, orgId, boardId, id);
      setBoard({ ...board, statuses: board.statuses?.filter((s) => s.id !== id) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete status");
    }
  }

  async function handleCreateCategory(e: FormEvent) {
    e.preventDefault();
    if (!token || !board) return;
    try {
      const res = await categories.create(token, orgId, boardId, {
        category: { name: catName, color: catColor },
      });
      setBoard({ ...board, categories: [...(board.categories || []), res.data] });
      setCatName("");
      setCatColor("#6b7280");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create category");
    }
  }

  async function handleUpdateCategory(e: FormEvent) {
    e.preventDefault();
    if (!token || !board || !editingCat) return;
    try {
      const res = await categories.update(token, orgId, boardId, editingCat.id, {
        category: { name: catName, color: catColor },
      });
      setBoard({
        ...board,
        categories: board.categories?.map((c) => (c.id === editingCat.id ? res.data : c)),
      });
      setEditingCat(null);
      setCatName("");
      setCatColor("#6b7280");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update category");
    }
  }

  async function handleDeleteCategory(id: number) {
    if (!token || !board || !confirm("Delete this category? Ideas in this category will be uncategorized.")) return;
    try {
      await categories.delete(token, orgId, boardId, id);
      setBoard({ ...board, categories: board.categories?.filter((c) => c.id !== id) });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete category");
    }
  }

  async function handleUpdateIdeaStatus(ideaId: number, statusId: number) {
    if (!token) return;
    try {
      const res = await adminIdeas.updateStatus(token, orgId, boardId, ideaId, statusId);
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, status: res.data.status } : i)));
      if (selectedIdea?.id === ideaId) setSelectedIdea({ ...selectedIdea, status: res.data.status });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    }
  }

  async function handleUpdateIdeaCategory(ideaId: number, categoryId: number | null) {
    if (!token) return;
    try {
      const res = await adminIdeas.updateCategory(token, orgId, boardId, ideaId, categoryId);
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? { ...i, category: res.data.category } : i)));
      if (selectedIdea?.id === ideaId) setSelectedIdea({ ...selectedIdea, category: res.data.category });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update category");
    }
  }

  async function handleDeleteIdea(ideaId: number) {
    if (!token || !confirm("Delete this idea?")) return;
    try {
      await adminIdeas.delete(token, orgId, boardId, ideaId);
      setIdeas((prev) => prev.filter((i) => i.id !== ideaId));
      if (selectedIdea?.id === ideaId) setSelectedIdea(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete idea");
    }
  }

  async function loadComments(ideaId: number) {
    if (!token || !board) return;
    try {
      const orgRes = await import("@/lib/api").then(({ organizations }) => organizations.get(token, orgId));
      const res = await publicBoard.comments(orgRes.data.slug, board.slug, ideaId);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch {
      setComments([]);
    }
  }

  async function handlePostAdminComment(e: FormEvent) {
    e.preventDefault();
    if (!token || !selectedIdea) return;
    try {
      const res = await adminComments.create(token, orgId, boardId, selectedIdea.id, { body: adminComment });
      setComments((prev) => [...prev, res.data]);
      setAdminComment("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to post comment");
    }
  }

  async function handleDeleteComment(commentId: number) {
    if (!token || !selectedIdea || !confirm("Delete this comment?")) return;
    try {
      await adminComments.delete(token, orgId, boardId, selectedIdea.id, commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete comment");
    }
  }

  async function handleDeleteBoard() {
    if (!token || !confirm("Delete this board and all its data? This cannot be undone.")) return;
    try {
      await boards.delete(token, orgId, boardId);
      router.push(`/dashboard/${orgId}/boards`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete board");
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!board) return <p className="text-red-600">Board not found.</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/${orgId}/boards`} className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold">{board.name}</h1>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {(["ideas", "statuses", "categories"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-sm pb-2 capitalize ${activeTab === tab ? "font-medium text-indigo-600 border-b-2 border-indigo-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            {tab} {tab === "statuses" ? `(${board.statuses?.length || 0})` : tab === "categories" ? `(${board.categories?.length || 0})` : `(${ideas.length})`}
          </button>
        ))}
      </div>

      {/* Ideas tab */}
      {activeTab === "ideas" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Idea list */}
          <div className="space-y-2">
            {ideas.length === 0 ? (
              <p className="text-gray-500 text-sm py-4">No ideas yet.</p>
            ) : ideas.map((idea) => (
              <div
                key={idea.id}
                onClick={() => {
                  setSelectedIdea(idea);
                  loadComments(idea.id);
                }}
                className={`p-3 bg-white rounded-lg border cursor-pointer transition ${selectedIdea?.id === idea.id ? "border-indigo-300 ring-1 ring-indigo-200" : "border-gray-200 hover:border-gray-300"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-sm">{idea.title}</h3>
                  <span className="text-xs text-gray-400 shrink-0">{idea.votes_count} votes</span>
                </div>
                <div className="flex gap-2 mt-2">
                  {idea.status && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: idea.status.color + "20", color: idea.status.color }}>
                      {idea.status.name}
                    </span>
                  )}
                  {idea.category && (
                    <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: idea.category.color + "20", color: idea.category.color }}>
                      {idea.category.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Idea detail */}
          {selectedIdea && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{selectedIdea.title}</h3>
                <button onClick={() => handleDeleteIdea(selectedIdea.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-wrap">{selectedIdea.description}</p>
              <div className="text-xs text-gray-400">
                by {selectedIdea.author.name} &middot; {new Date(selectedIdea.created_at).toLocaleDateString()}
              </div>

              {/* Status & Category controls */}
              <div className="flex gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select
                    value={selectedIdea.status?.id || ""}
                    onChange={(e) => handleUpdateIdeaStatus(selectedIdea.id, Number(e.target.value))}
                    className="text-xs px-2 py-1 border border-gray-200 rounded"
                  >
                    <option value="">None</option>
                    {board.statuses?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Category</label>
                  <select
                    value={selectedIdea.category?.id || ""}
                    onChange={(e) => handleUpdateIdeaCategory(selectedIdea.id, e.target.value ? Number(e.target.value) : null)}
                    className="text-xs px-2 py-1 border border-gray-200 rounded"
                  >
                    <option value="">None</option>
                    {board.categories?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Comments */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Comments ({comments.length})</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {comments.map((c) => (
                    <div key={c.id} className={`p-2 rounded text-sm ${c.admin_comment ? "bg-indigo-50 border border-indigo-100" : "bg-gray-50"}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs">
                          {c.author.name}
                          {c.admin_comment && <span className="ml-1 text-xs px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded">Admin</span>}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{new Date(c.created_at).toLocaleDateString()}</span>
                          <button onClick={() => handleDeleteComment(c.id)} className="text-xs text-red-400 hover:text-red-600">Delete</button>
                        </div>
                      </div>
                      <p className="text-gray-700">{c.body}</p>
                    </div>
                  ))}
                </div>

                {/* Admin comment form */}
                <form onSubmit={handlePostAdminComment} className="mt-3 flex gap-2">
                  <input
                    value={adminComment}
                    onChange={(e) => setAdminComment(e.target.value)}
                    placeholder="Write an admin comment..."
                    required
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button type="submit" className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                    Post
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Statuses tab */}
      {activeTab === "statuses" && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={editingStatus ? handleUpdateStatus : handleCreateStatus} className="flex gap-2 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{editingStatus ? "Edit Status" : "New Status"}</label>
              <input
                required
                value={statusName}
                onChange={(e) => setStatusName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Status name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={statusColor}
                onChange={(e) => setStatusColor(e.target.value)}
                className="h-10 w-14 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              {editingStatus ? "Update" : "Add"}
            </button>
            {editingStatus && (
              <button type="button" onClick={() => { setEditingStatus(null); setStatusName(""); setStatusColor("#6b7280"); }} className="px-3 py-2 text-sm text-gray-500">
                Cancel
              </button>
            )}
          </form>

          <div className="divide-y divide-gray-100">
            {board.statuses?.sort((a, b) => a.position - b.position).map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm font-medium">{s.name}</span>
                  {s.is_default && <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">default</span>}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingStatus(s); setStatusName(s.name); setStatusColor(s.color); }}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteStatus(s.id)} className="text-xs text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories tab */}
      {activeTab === "categories" && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <form onSubmit={editingCat ? handleUpdateCategory : handleCreateCategory} className="flex gap-2 mb-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">{editingCat ? "Edit Category" : "New Category"}</label>
              <input
                required
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Category name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <input
                type="color"
                value={catColor}
                onChange={(e) => setCatColor(e.target.value)}
                className="h-10 w-14 border border-gray-300 rounded-lg cursor-pointer"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              {editingCat ? "Update" : "Add"}
            </button>
            {editingCat && (
              <button type="button" onClick={() => { setEditingCat(null); setCatName(""); setCatColor("#6b7280"); }} className="px-3 py-2 text-sm text-gray-500">
                Cancel
              </button>
            )}
          </form>

          <div className="divide-y divide-gray-100">
            {board.categories?.sort((a, b) => a.position - b.position).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-sm font-medium">{c.name}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditingCat(c); setCatName(c.name); setCatColor(c.color); }}
                    className="text-xs text-indigo-500 hover:text-indigo-700"
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-xs text-red-500 hover:text-red-700">
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {(!board.categories || board.categories.length === 0) && (
              <p className="text-sm text-gray-500 py-2">No categories yet.</p>
            )}
          </div>
        </div>
      )}

      {/* Delete board */}
      <div className="bg-white rounded-xl border border-red-200 p-5">
        <h3 className="text-sm font-semibold text-red-600 mb-2">Danger Zone</h3>
        <button
          onClick={handleDeleteBoard}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
        >
          Delete Board
        </button>
      </div>
    </div>
  );
}
