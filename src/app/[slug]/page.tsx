"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { publicBoard, ApiError } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import type { PublicBoard, Idea, PaginationMeta } from "@/types";
import {
  Button,
  Input,
  Textarea,
  Badge,
  Modal,
  ColorDot,
  EmptyState,
} from "@/components/ui";

type SortOption = "trending" | "most_voted" | "latest";

export default function PublicBoardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("trending");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [topicFilter, setTopicFilter] = useState<string>("");
  const [page, setPage] = useState(1);

  // Submit modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitTitle, setSubmitTitle] = useState("");
  const [submitDesc, setSubmitDesc] = useState("");
  const [submitName, setSubmitName] = useState("");
  const [submitEmail, setSubmitEmail] = useState("");
  const [submitTopicIds, setSubmitTopicIds] = useState<number[]>([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitPendingApproval, setSubmitPendingApproval] = useState(false);

  useEffect(() => {
    setSessionId(getSessionId(slug));
  }, [slug]);

  useEffect(() => {
    publicBoard.get(slug).then((res) => setBoard(res.data)).catch(() => {});
  }, [slug]);

  const fetchIdeas = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page) };
      if (search) p.search = search;
      if (sort) p.sort = sort;
      if (statusFilter) p.status_id = statusFilter;
      if (topicFilter) p.topic_id = topicFilter;
      if (sessionId) p.session_id = sessionId;
      const res = await publicBoard.ideas(slug, p);
      setIdeas(res.data.ideas);
      setMeta(res.data.meta);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug, page, search, sort, statusFilter, topicFilter, sessionId]);

  useEffect(() => {
    if (sessionId) fetchIdeas();
  }, [fetchIdeas, sessionId]);

  async function handleVote(ideaId: number) {
    if (!sessionId) return;
    // Optimistic
    setIdeas((prev) =>
      prev.map((i) =>
        i.id === ideaId
          ? {
              ...i,
              voted: !i.voted,
              votes_count: i.voted ? i.votes_count - 1 : i.votes_count + 1,
            }
          : i
      )
    );
    try {
      const res = await publicBoard.vote(slug, ideaId, sessionId);
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId
            ? { ...i, voted: res.data.voted, votes_count: res.data.votes_count }
            : i
        )
      );
    } catch {
      // Revert on error
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === ideaId
            ? {
                ...i,
                voted: !i.voted,
                votes_count: i.voted ? i.votes_count - 1 : i.votes_count + 1,
              }
            : i
        )
      );
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setSubmitLoading(true);
    try {
      const res = await publicBoard.createIdea(slug, {
        title: submitTitle,
        description: submitDesc || undefined,
        author_name: submitName,
        author_email: submitEmail,
        topic_ids: submitTopicIds.length > 0 ? submitTopicIds : undefined,
      });
      setSubmitPendingApproval(!!res.data.pending_approval);
      setSubmitSuccess(true);
      setSubmitTitle("");
      setSubmitDesc("");
      setSubmitTopicIds([]);
      // Store name/email for reuse
      localStorage.setItem("fk_author_name", submitName);
      localStorage.setItem("fk_author_email", submitEmail);
      fetchIdeas();
      setTimeout(() => {
        setShowSubmitModal(false);
        setSubmitSuccess(false);
      }, 1500);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError ? err.message : "Failed to submit idea"
      );
    } finally {
      setSubmitLoading(false);
    }
  }

  function openSubmitModal() {
    // Pre-fill stored author info
    const storedName = localStorage.getItem("fk_author_name") || "";
    const storedEmail = localStorage.getItem("fk_author_email") || "";
    if (storedName) setSubmitName(storedName);
    if (storedEmail) setSubmitEmail(storedEmail);
    setShowSubmitModal(true);
  }

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: "trending", label: "Trending" },
    { key: "most_voted", label: "Most voted" },
    { key: "latest", label: "Latest" },
  ];

  if (!board) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ "--color-accent": board.accent_color } as React.CSSProperties}
    >
      {/* Header */}
      <header className="border-b border-edge bg-surface">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif text-ink">{board.name}</h1>
              <p className="text-subtle mt-1">Help us build a better product</p>
            </div>
            <Button onClick={openSubmitModal}>Submit Idea</Button>
          </div>
          <nav className="flex gap-1 mt-6 -mb-px">
            <Link
              href={`/${slug}`}
              className="px-4 py-2 text-sm font-medium text-accent border-b-2 border-accent"
            >
              Ideas
            </Link>
            <Link
              href={`/${slug}/roadmap`}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-ink border-b-2 border-transparent"
            >
              Roadmap
            </Link>
            <Link
              href={`/${slug}/updates`}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-ink border-b-2 border-transparent"
            >
              Updates
            </Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-6 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="w-[220px] shrink-0 hidden md:block">
          <div className="sticky top-6 space-y-6">
            {/* Search */}
            <Input
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="!py-2 !text-sm"
            />

            {/* Sort */}
            <div>
              <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                Sort by
              </h3>
              <div className="space-y-0.5">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setSort(opt.key);
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                      sort === opt.key
                        ? "bg-accent-soft text-accent font-medium"
                        : "text-subtle hover:text-ink hover:bg-cream"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Status filter */}
            {board.statuses.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Status
                </h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setStatusFilter("");
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                      !statusFilter
                        ? "bg-accent-soft text-accent font-medium"
                        : "text-subtle hover:text-ink hover:bg-cream"
                    }`}
                  >
                    All
                  </button>
                  {board.statuses.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setStatusFilter(String(s.id));
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        statusFilter === String(s.id)
                          ? "bg-accent-soft text-accent font-medium"
                          : "text-subtle hover:text-ink hover:bg-cream"
                      }`}
                    >
                      <ColorDot color={s.color} />
                      <span className="flex-1 truncate">{s.name}</span>
                      <span className="text-xs text-muted">{s.ideas_count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Topics filter */}
            {board.topics.length > 0 && (
              <div>
                <h3 className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                  Topics
                </h3>
                <div className="space-y-0.5">
                  <button
                    onClick={() => {
                      setTopicFilter("");
                      setPage(1);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer ${
                      !topicFilter
                        ? "bg-accent-soft text-accent font-medium"
                        : "text-subtle hover:text-ink hover:bg-cream"
                    }`}
                  >
                    All
                  </button>
                  {board.topics.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTopicFilter(String(t.id));
                        setPage(1);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-md text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                        topicFilter === String(t.id)
                          ? "bg-accent-soft text-accent font-medium"
                          : "text-subtle hover:text-ink hover:bg-cream"
                      }`}
                    >
                      <span style={{ color: t.color }} className="font-bold text-xs">
                        #
                      </span>
                      <span className="flex-1 truncate">{t.name}</span>
                      <span className="text-xs text-muted">{t.ideas_count}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile search */}
          <div className="md:hidden mb-4">
            <Input
              placeholder="Search ideas..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {loading ? (
            <p className="text-muted py-12 text-center">Loading ideas...</p>
          ) : ideas.length === 0 ? (
            <EmptyState
              title="No ideas yet"
              description="Be the first to submit an idea!"
              action={<Button onClick={openSubmitModal}>Submit Idea</Button>}
            />
          ) : (
            <div className="bg-surface rounded-xl border border-edge divide-y divide-edge">
              {ideas.map((idea, i) => (
                <div
                  key={idea.id}
                  className="flex items-start gap-4 p-4 hover:bg-cream/50 transition-colors cursor-pointer animate-slide-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: "both" }}
                  onClick={() => router.push(`/${slug}/ideas/${idea.id}`)}
                >
                  {/* Vote button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleVote(idea.id);
                    }}
                    className={`flex flex-col items-center justify-center min-w-[48px] py-2 rounded-lg border transition-all cursor-pointer shrink-0 ${
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink">{idea.title}</h3>
                    {idea.description && (
                      <p className="text-sm text-subtle mt-0.5 line-clamp-1">
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
                      {idea.comments_count > 0 && (
                        <span className="text-xs text-muted flex items-center gap-1">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                          </svg>
                          {idea.comments_count}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
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
        </main>
      </div>

      {/* Submit Idea Modal */}
      <Modal
        open={showSubmitModal}
        onClose={() => {
          setShowSubmitModal(false);
          setSubmitSuccess(false);
          setSubmitError("");
        }}
        title="Submit an Idea"
        description="Share your feedback and help us improve."
        size="lg"
      >
        {submitSuccess ? (
          <div className="py-6 text-center animate-fade-in">
            <div className="w-12 h-12 bg-positive-soft rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-positive"
              >
                <path d="M20 6 9 17l-5-5" />
              </svg>
            </div>
            <p className="font-medium text-ink">Idea submitted!</p>
            <p className="text-sm text-subtle mt-1">
              {submitPendingApproval
                ? "Thank you! Your idea will be visible after it's reviewed and approved by the team."
                : "Thank you for your feedback."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {submitError && (
              <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
                {submitError}
              </div>
            )}
            <Input
              label="Title"
              required
              value={submitTitle}
              onChange={(e) => setSubmitTitle(e.target.value)}
              placeholder="A short summary of your idea"
            />
            <Textarea
              label="Description"
              value={submitDesc}
              onChange={(e) => setSubmitDesc(e.target.value)}
              placeholder="Explain your idea in more detail..."
              rows={4}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Your Name"
                required
                value={submitName}
                onChange={(e) => setSubmitName(e.target.value)}
                placeholder="Jane Smith"
              />
              <Input
                label="Email"
                required
                type="email"
                value={submitEmail}
                onChange={(e) => setSubmitEmail(e.target.value)}
                placeholder="jane@example.com"
              />
            </div>
            {board.topics.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-ink">
                  Topics
                </label>
                <div className="flex flex-wrap gap-2">
                  {board.topics.map((t) => (
                    <label
                      key={t.id}
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                        submitTopicIds.includes(t.id)
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-edge bg-surface text-subtle hover:border-edge-strong"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={submitTopicIds.includes(t.id)}
                        onChange={() =>
                          setSubmitTopicIds((prev) =>
                            prev.includes(t.id)
                              ? prev.filter((id) => id !== t.id)
                              : [...prev, t.id]
                          )
                        }
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
              <Button type="submit" loading={submitLoading}>
                {submitLoading ? "Submitting..." : "Submit Idea"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowSubmitModal(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
