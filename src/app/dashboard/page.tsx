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
  const [sortBy, setSortBy] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "pending" | "archived">("all");
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
      if (search) params.q = search;
      if (statusFilter) params.status_id = statusFilter;
      if (sortBy) params.sort = sortBy;
      if (viewFilter === "pending") params.pending = "true";
      if (viewFilter === "archived") params.archived = "true";
      const res = await adminIdeas.list(token, params);
      setIdeas(res.data.ideas);
      setMeta(res.data.meta);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter, sortBy, viewFilter]);

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

  async function handleApprove(ideaId: number) {
    if (!token) return;
    try {
      const res = await adminIdeas.approve(token, ideaId);
      setIdeas((prev) => prev.map((i) => (i.id === ideaId ? res.data : i)));
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
          <div className="flex items-center gap-1 ml-2 bg-cream rounded-lg p-0.5">
            {(["all", ...(proj?.require_approval ? ["pending"] : []), "archived"] as const).map((f) => (
              <button
                key={f}
                onClick={() => { setViewFilter(f as typeof viewFilter); setPage(1); }}
                className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer capitalize ${
                  viewFilter === f ? "bg-surface text-ink shadow-xs font-medium" : "text-muted hover:text-subtle"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
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
          <Select
            options={[
              { value: "", label: "Latest" },
              { value: "votes", label: "Most voted" },
              { value: "oldest", label: "Oldest" },
            ]}
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className="sm:max-w-[150px]"
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
                    {idea.pending && (
                      <Badge variant="warning" size="sm">Pending Approval</Badge>
                    )}
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
                  <Select
                    options={[
                      { value: "", label: "Status" },
                      ...(proj?.statuses?.map((s) => ({ value: String(s.id), label: s.name })) || []),
                    ]}
                    value={String(idea.status?.id ?? "")}
                    onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                    className="!py-1.5 !pl-2.5 !pr-8 !text-xs !rounded-md sm:max-w-[140px]"
                  />
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === idea.id && (
                <div className="border-t border-edge animate-slide-up">
                  <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px]">
                    {/* Left: Content + Comments */}
                    <div className="p-5 space-y-5">
                      {/* Description */}
                      {idea.description && (
                        <div className="prose-sm">
                          <p className="text-sm text-ink leading-relaxed whitespace-pre-wrap">{idea.description}</p>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-muted">
                        <span>by <span className="text-subtle font-medium">{idea.author_name}</span></span>
                        {idea.author_email && <span>{idea.author_email}</span>}
                        <span>{new Date(idea.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                        <span className="capitalize">{idea.source}</span>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-edge" />

                      {/* Comments */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-ink">
                            Comments
                          </h4>
                          <span className="text-xs text-muted bg-cream px-1.5 py-0.5 rounded-full">{idea.comments_count}</span>
                        </div>

                        {commentLoading === idea.id ? (
                          <div className="flex items-center gap-2 py-4">
                            <div className="w-4 h-4 border-2 border-edge border-t-accent rounded-full animate-spin" />
                            <span className="text-xs text-muted">Loading comments...</span>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {(comments[idea.id] || []).length === 0 && (
                              <p className="text-sm text-muted py-2">No comments yet. Be the first to reply.</p>
                            )}
                            {(comments[idea.id] || []).map((c, ci) => (
                              <div
                                key={c.id}
                                className={`group relative rounded-xl text-sm transition-all ${
                                  c.is_official
                                    ? "bg-accent-soft/40 border border-accent/10 pl-4 before:absolute before:left-0 before:top-3 before:bottom-3 before:w-[3px] before:rounded-full before:bg-accent"
                                    : "bg-cream/60 border border-edge pl-4"
                                }`}
                                style={{ animationDelay: `${ci * 40}ms`, animationFillMode: "both" }}
                              >
                                <div className="p-3 pl-2">
                                  <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                                        style={{ backgroundColor: c.is_official ? "#c2410c" : "#9c968f" }}>
                                        {c.author.name.charAt(0).toUpperCase()}
                                      </span>
                                      <span className="font-semibold text-ink text-xs">{c.author.name}</span>
                                      {c.is_official && (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-soft px-1.5 py-0.5 rounded">Team</span>
                                      )}
                                      <span className="text-[11px] text-faint">
                                        {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                      </span>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteComment(idea.id, c.id)}
                                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-muted hover:text-critical hover:bg-critical-soft transition-all cursor-pointer"
                                      title="Delete comment"
                                    >
                                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                      </svg>
                                    </button>
                                  </div>
                                  <p className="text-subtle leading-relaxed whitespace-pre-wrap">{c.body}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reply form */}
                        <div className="mt-4 relative">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-[10px] font-bold text-white shrink-0 mt-2">
                              You
                            </span>
                            <div className="flex-1 space-y-2">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write an official reply..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 text-sm text-ink bg-surface border border-edge rounded-xl placeholder:text-muted transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20 resize-none"
                              />
                              <div className="flex justify-between items-center">
                                <span className="text-[11px] text-faint">Replies are marked as official team responses</span>
                                <Button
                                  size="sm"
                                  loading={replyLoading}
                                  onClick={() => handleReply(idea.id)}
                                  disabled={!replyText.trim()}
                                >
                                  {replyLoading ? "Sending..." : "Reply as Team"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions Sidebar */}
                    <div className="border-t lg:border-t-0 lg:border-l border-edge p-5 bg-cream/30 space-y-5">
                      {/* Status */}
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 block">Status</label>
                        <Select
                          options={[
                            { value: "", label: "No status" },
                            ...(proj?.statuses?.map((s) => ({ value: String(s.id), label: s.name })) || []),
                          ]}
                          value={String(idea.status?.id ?? "")}
                          onChange={(e) => handleStatusChange(idea.id, e.target.value)}
                        />
                      </div>

                      {/* Topics */}
                      {proj?.topics && proj.topics.length > 0 && (
                        <div>
                          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 block">Topics</label>
                          <div className="flex flex-wrap gap-1.5">
                            {proj.topics.map((t) => {
                              const isActive = idea.topics.some((it) => it.id === t.id);
                              return (
                                <button
                                  key={t.id}
                                  onClick={() => {
                                    const newIds = isActive
                                      ? idea.topics.filter((it) => it.id !== t.id).map((it) => it.id)
                                      : [...idea.topics.map((it) => it.id), t.id];
                                    if (token) {
                                      adminIdeas.updateTopics(token, idea.id, newIds).then((res) => {
                                        setIdeas((prev) => prev.map((i) => (i.id === idea.id ? res.data : i)));
                                      });
                                    }
                                  }}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                                    isActive
                                      ? "ring-1 ring-offset-1 shadow-sm"
                                      : "opacity-50 hover:opacity-80"
                                  }`}
                                  style={{
                                    backgroundColor: `${t.color}18`,
                                    color: t.color,
                                    ...(isActive ? { ringColor: t.color } : {}),
                                  }}
                                >
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.color }} />
                                  {t.name}
                                  {isActive && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                      <path d="M18 6 6 18M6 6l12 12" />
                                    </svg>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Votes */}
                      <div>
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 block">Votes</label>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-ink">{idea.votes_count}</span>
                          <span className="text-xs text-muted">upvotes</span>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="border-t border-edge" />

                      {/* Actions */}
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 block">Actions</label>

                        {idea.pending && (
                          <button
                            onClick={() => handleApprove(idea.id)}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium bg-positive-soft text-positive hover:bg-positive/10 transition-colors cursor-pointer"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                            Approve &amp; Publish
                          </button>
                        )}

                        <button
                          onClick={() => handleArchive(idea.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-subtle hover:bg-cream hover:text-ink transition-colors cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="20" height="5" x="2" y="3" rx="1" />
                            <path d="M4 8v11a2 2 0 002 2h12a2 2 0 002-2V8M10 12h4" />
                          </svg>
                          {idea.archived ? "Unarchive" : "Archive"}
                        </button>

                        <button
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted hover:bg-critical-soft hover:text-critical transition-colors cursor-pointer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                          </svg>
                          Delete permanently
                        </button>
                      </div>
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
