"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { adminIdeas, project as projectApi, ApiError } from "@/lib/api";
import type { Project, Idea, Comment, PaginationMeta } from "@/types";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  Modal,
  EmptyState,
} from "@/components/ui";

export default function DashboardPage() {
  const { token } = useAuth();
  const [proj, setProj] = useState<Project | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [commentLoading, setCommentLoading] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newTopicIds, setNewTopicIds] = useState<number[]>([]);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");

  const fetchIdeas = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (search) params.search = search;
      if (statusFilter) params.status_id = statusFilter;
      const res = await adminIdeas.list(token, params);
      setIdeas(res.data.ideas);
      setMeta(res.data.meta);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => {
    if (token) {
      projectApi.get(token).then((res) => setProj(res.data)).catch(() => {});
    }
  }, [token]);

  useEffect(() => {
    fetchIdeas();
  }, [fetchIdeas]);

  async function handleVote(ideaId: number) {
    if (!token) return;
    try {
      const res = await adminIdeas.vote(token, ideaId);
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId
            ? { ...i, voted: res.data.voted, votes_count: res.data.votes_count }
            : i
        )
      );
    } catch {
      // ignore
    }
  }

  async function handleStatusChange(ideaId: number, statusId: string) {
    if (!token || !statusId) return;
    try {
      const res = await adminIdeas.updateStatus(token, ideaId, Number(statusId));
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? res.data : i)));
    } catch {
      // ignore
    }
  }

  async function loadComments(ideaId: number) {
    if (!token) return;
    setCommentLoading(ideaId);
    try {
      const res = await adminIdeas.comments(token, ideaId);
      setComments((prev) => ({ ...prev, [ideaId]: res.data }));
    } catch {
      // ignore
    } finally {
      setCommentLoading(null);
    }
  }

  function handleExpand(ideaId: number) {
    if (expandedId === ideaId) {
      setExpandedId(null);
    } else {
      setExpandedId(ideaId);
      if (!comments[ideaId]) {
        loadComments(ideaId);
      }
    }
  }

  async function handleReply(ideaId: number) {
    if (!token || !replyText.trim()) return;
    setReplyLoading(true);
    try {
      const res = await adminIdeas.createComment(token, ideaId, { body: replyText });
      setComments((prev) => ({
        ...prev,
        [ideaId]: [...(prev[ideaId] || []), res.data],
      }));
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, comments_count: i.comments_count + 1 } : i
        )
      );
      setReplyText("");
    } catch {
      // ignore
    } finally {
      setReplyLoading(false);
    }
  }

  async function handleArchive(ideaId: number) {
    if (!token) return;
    try {
      const idea = ideas.find((i) => i.id === ideaId);
      if (idea?.archived) {
        await adminIdeas.unarchive(token, ideaId);
      } else {
        await adminIdeas.archive(token, ideaId);
      }
      fetchIdeas();
    } catch {
      // ignore
    }
  }

  async function handleDeleteIdea(ideaId: number) {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this idea?")) return;
    try {
      await adminIdeas.delete(token, ideaId);
      setExpandedId(null);
      fetchIdeas();
    } catch {
      // ignore
    }
  }

  async function handleAddIdea(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setAddError("");
    setAddLoading(true);
    try {
      await adminIdeas.create(token, {
        title: newTitle,
        description: newDesc || undefined,
        topic_ids: newTopicIds.length > 0 ? newTopicIds : undefined,
      });
      setShowAddModal(false);
      setNewTitle("");
      setNewDesc("");
      setNewTopicIds([]);
      fetchIdeas();
    } catch (err) {
      setAddError(err instanceof ApiError ? err.message : "Failed to create idea");
    } finally {
      setAddLoading(false);
    }
  }

  function toggleNewTopic(topicId: number) {
    setNewTopicIds((prev) =>
      prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId]
    );
  }

  async function handleDeleteComment(ideaId: number, commentId: number) {
    if (!token) return;
    try {
      await adminIdeas.deleteComment(token, ideaId, commentId);
      setComments((prev) => ({
        ...prev,
        [ideaId]: (prev[ideaId] || []).filter((c) => c.id !== commentId),
      }));
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId ? { ...i, comments_count: Math.max(0, i.comments_count - 1) } : i
        )
      );
    } catch {
      // ignore
    }
  }

  const atLimit =
    proj?.plan?.max_ideas != null && proj.ideas_count >= proj.plan.max_ideas;
  const ideaCountLabel =
    proj?.plan?.max_ideas != null
      ? `${proj.ideas_count} of ${proj.plan.max_ideas}`
      : String(proj?.ideas_count ?? 0);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-serif text-ink">Ideas</h1>
          <Badge className="bg-accent-soft text-accent">{ideaCountLabel}</Badge>
        </div>
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:justify-end">
          <Input
            placeholder="Search ideas..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="sm:max-w-[220px]"
          />
          <Select
            options={[
              { value: "", label: "All statuses" },
              ...(proj?.statuses?.map((s) => ({
                value: String(s.id),
                label: s.name,
              })) || []),
            ]}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="sm:max-w-[180px]"
          />
          <Button onClick={() => setShowAddModal(true)} disabled={atLimit}>
            + Add Idea
          </Button>
        </div>
      </div>

      {/* Plan limit banner */}
      {atLimit && (
        <div className="bg-caution-soft text-caution px-4 py-3 rounded-lg text-sm flex items-center justify-between">
          <span>You&apos;ve reached the idea limit on your current plan.</span>
          <span className="font-medium cursor-pointer hover:underline">
            Upgrade to Pro &#8594;
          </span>
        </div>
      )}

      {/* Ideas list */}
      {loading ? (
        <p className="text-muted py-8 text-center">Loading ideas...</p>
      ) : ideas.length === 0 ? (
        <Card>
          <EmptyState
            title="No ideas yet"
            description="Create your first idea or share your board with users to start collecting feedback."
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            }
            action={
              <Button onClick={() => setShowAddModal(true)}>+ Add Idea</Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <Card key={idea.id} padding="none">
              <div className="flex items-start gap-4 p-4">
                {/* Vote button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(idea.id);
                  }}
                  className={`flex flex-col items-center justify-center min-w-[48px] py-2 rounded-lg border transition-all cursor-pointer ${
                    idea.voted
                      ? "bg-accent-soft border-accent text-accent"
                      : "bg-cream border-edge text-subtle hover:border-edge-strong"
                  }`}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={idea.voted ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m18 15-6-6-6 6" />
                  </svg>
                  <span className="text-sm font-semibold">{idea.votes_count}</span>
                </button>

                {/* Content */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleExpand(idea.id)}
                >
                  <div className="flex items-start gap-2">
                    <h3 className="font-medium text-ink">{idea.title}</h3>
                  </div>
                  {idea.description && (
                    <p className="text-sm text-subtle mt-1 line-clamp-2">
                      {idea.description}
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {idea.status && (
                      <Badge color={idea.status.color} dot size="sm">
                        {idea.status.name}
                      </Badge>
                    )}
                    {idea.topics.map((t) => (
                      <Badge key={t.id} color={t.color} size="sm">
                        {t.name}
                      </Badge>
                    ))}
                    <span className="text-xs text-muted flex items-center gap-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {idea.comments_count}
                    </span>
                  </div>
                </div>

                {/* Status inline select */}
                <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={idea.status?.id ?? ""}
                    onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                    className="text-xs px-2 py-1.5 rounded-md border border-edge bg-surface text-subtle cursor-pointer focus:border-accent focus:ring-1 focus:ring-accent/20"
                  >
                    <option value="" disabled>
                      Status
                    </option>
                    {proj?.statuses?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === idea.id && (
                <div className="border-t border-edge px-4 py-4 bg-cream/50 animate-slide-up">
                  {idea.description && (
                    <p className="text-sm text-ink whitespace-pre-wrap mb-4">
                      {idea.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleArchive(idea.id)}
                    >
                      {idea.archived ? "Unarchive" : "Archive"}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteIdea(idea.id)}
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Comments */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-ink">
                      Comments ({idea.comments_count})
                    </h4>
                    {commentLoading === idea.id ? (
                      <p className="text-xs text-muted">Loading comments...</p>
                    ) : (
                      <>
                        {(comments[idea.id] || []).length === 0 && (
                          <p className="text-xs text-muted">No comments yet.</p>
                        )}
                        {(comments[idea.id] || []).map((c) => (
                          <div
                            key={c.id}
                            className={`p-3 rounded-lg text-sm ${
                              c.is_official
                                ? "bg-inform-soft border border-inform/20"
                                : "bg-surface border border-edge"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-ink text-xs">
                                {c.author.name}
                                {c.author.is_admin && (
                                  <Badge variant="info" size="sm" className="ml-1.5">
                                    Admin
                                  </Badge>
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted">
                                  {new Date(c.created_at).toLocaleDateString()}
                                </span>
                                <button
                                  onClick={() => handleDeleteComment(idea.id, c.id)}
                                  className="text-xs text-muted hover:text-critical cursor-pointer"
                                  title="Delete comment"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            <p className="text-subtle whitespace-pre-wrap">{c.body}</p>
                          </div>
                        ))}
                      </>
                    )}

                    {/* Reply form */}
                    <div className="flex gap-2">
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write an admin reply..."
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        loading={replyLoading}
                        onClick={() => handleReply(idea.id)}
                        disabled={!replyText.trim()}
                        className="self-end"
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-subtle px-3">
            Page {meta.page} of {meta.total_pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= meta.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Idea Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Idea"
        description="Create a new idea on behalf of your team."
      >
        <form onSubmit={handleAddIdea} className="space-y-4">
          {addError && (
            <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
              {addError}
            </div>
          )}
          <Input
            label="Title"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="What's the idea?"
          />
          <Textarea
            label="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Add more context..."
            rows={4}
          />
          {proj?.topics && proj.topics.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Topics</label>
              <div className="flex flex-wrap gap-2">
                {proj.topics.map((t) => (
                  <label
                    key={t.id}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                      newTopicIds.includes(t.id)
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-edge bg-surface text-subtle hover:border-edge-strong"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={newTopicIds.includes(t.id)}
                      onChange={() => toggleNewTopic(t.id)}
                      className="sr-only"
                    />
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: t.color }}
                    />
                    {t.name}
                  </label>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={addLoading}>
              {addLoading ? "Creating..." : "Create Idea"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
