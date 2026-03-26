"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicBoard, ApiError } from "@/lib/api";
import { getSessionId } from "@/lib/session";
import type { Idea, Comment } from "@/types";
import { Button, Textarea, Input, Badge } from "@/components/ui";

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const seconds = Math.floor((now - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function PublicIdeaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = Number(params.id);

  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState("");

  // Comment form
  const [commentBody, setCommentBody] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [showAuthorFields, setShowAuthorFields] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    const sid = getSessionId(slug);
    setSessionId(sid);

    // Restore stored author info
    const storedName = localStorage.getItem("fk_author_name") || "";
    const storedEmail = localStorage.getItem("fk_author_email") || "";
    if (storedName && storedEmail) {
      setAuthorName(storedName);
      setAuthorEmail(storedEmail);
      setShowAuthorFields(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    Promise.all([
      publicBoard.getIdea(slug, id, sessionId),
      publicBoard.comments(slug, id),
    ])
      .then(([ideaRes, commentsRes]) => {
        setIdea(ideaRes.data);
        setComments(commentsRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, id, sessionId]);

  async function handleVote() {
    if (!sessionId || !idea) return;
    // Optimistic
    setIdea({
      ...idea,
      voted: !idea.voted,
      votes_count: idea.voted ? idea.votes_count - 1 : idea.votes_count + 1,
    });
    try {
      const res = await publicBoard.vote(slug, idea.id, sessionId);
      setIdea((prev) =>
        prev
          ? { ...prev, voted: res.data.voted, votes_count: res.data.votes_count }
          : prev
      );
    } catch {
      // Revert
      setIdea((prev) =>
        prev
          ? {
              ...prev,
              voted: !prev.voted,
              votes_count: prev.voted
                ? prev.votes_count - 1
                : prev.votes_count + 1,
            }
          : prev
      );
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!commentBody.trim() || !authorName.trim() || !authorEmail.trim()) return;
    setCommentError("");
    setCommentLoading(true);
    try {
      const res = await publicBoard.createComment(slug, id, {
        body: commentBody,
        author_name: authorName,
        author_email: authorEmail,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentBody("");
      setIdea((prev) =>
        prev ? { ...prev, comments_count: prev.comments_count + 1 } : prev
      );
      // Persist author info
      localStorage.setItem("fk_author_name", authorName);
      localStorage.setItem("fk_author_email", authorEmail);
      setShowAuthorFields(false);
    } catch (err) {
      setCommentError(
        err instanceof ApiError ? err.message : "Failed to post comment"
      );
    } finally {
      setCommentLoading(false);
    }
  }

  if (loading || !idea) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">
      {/* Back link */}
      <Link
        href={`/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-subtle hover:text-ink transition-colors mb-6"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back to ideas
      </Link>

      {/* Idea header */}
      <div className="flex items-start gap-4">
        {/* Vote button */}
        <button
          onClick={handleVote}
          className={`flex flex-col items-center justify-center min-w-[56px] py-3 rounded-xl border-2 transition-all cursor-pointer shrink-0 ${
            idea.voted
              ? "bg-accent-soft border-accent text-accent"
              : "bg-surface border-edge text-subtle hover:border-edge-strong"
          }`}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill={idea.voted ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
          <span className="text-base font-bold">{idea.votes_count}</span>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-serif text-ink">{idea.title}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
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
            <span className="text-xs text-muted">
              by {idea.author_name}
            </span>
            <span className="text-xs text-muted">
              {timeAgo(idea.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Shipped banner */}
      {idea.updates && idea.updates.length > 0 && (
        <div className="bg-positive-soft border border-positive/20 rounded-lg px-4 py-3 text-sm flex items-center gap-2 mt-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-positive shrink-0">
            <path d="M20 6 9 17l-5-5" />
          </svg>
          <span>
            <span className="text-positive font-medium">Shipped!</span>
            {" "}This idea was addressed in{" "}
            {idea.updates.map((u, i) => (
              <span key={u.id}>
                {i > 0 && ", "}
                <Link href={`/${slug}/updates/${u.id}`} className="text-positive underline font-medium">{u.title}</Link>
              </span>
            ))}
          </span>
        </div>
      )}

      {/* Description */}
      {idea.description && (
        <div className="mt-6 text-subtle whitespace-pre-wrap leading-relaxed">
          {idea.description}
        </div>
      )}

      {/* Divider */}
      <hr className="border-edge my-8" />

      {/* Comments */}
      <div>
        <h2 className="text-lg font-serif text-ink mb-4">
          Comments{" "}
          <span className="text-muted text-sm font-sans">
            ({idea.comments_count})
          </span>
        </h2>

        {comments.length === 0 ? (
          <p className="text-sm text-muted py-4">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-3 mb-6">
            {comments.map((c, i) => (
              <div
                key={c.id}
                className={`p-4 rounded-lg text-sm animate-slide-up ${
                  c.is_official
                    ? "border-l-2 border-accent bg-inform-soft"
                    : "bg-surface border border-edge"
                }`}
                style={{
                  animationDelay: `${i * 40}ms`,
                  animationFillMode: "both",
                }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-medium text-ink">
                    {c.author.name}
                  </span>
                  {c.author.is_admin && (
                    <Badge variant="info" size="sm">
                      Team
                    </Badge>
                  )}
                  <span className="text-xs text-muted ml-auto">
                    {timeAgo(c.created_at)}
                  </span>
                </div>
                <p className="text-subtle whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}
          </div>
        )}

        {/* Comment form */}
        <form onSubmit={handleComment} className="space-y-3 mt-4">
          {commentError && (
            <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
              {commentError}
            </div>
          )}
          {showAuthorFields && (
            <div className="grid grid-cols-2 gap-3">
              <Input
                placeholder="Your name"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
              />
              <Input
                placeholder="Your email"
                required
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
              />
            </div>
          )}
          {!showAuthorFields && (
            <p className="text-xs text-muted">
              Commenting as{" "}
              <span className="font-medium text-subtle">{authorName}</span>
              <button
                type="button"
                onClick={() => setShowAuthorFields(true)}
                className="ml-1.5 text-accent hover:underline cursor-pointer"
              >
                Change
              </button>
            </p>
          )}
          <Textarea
            placeholder="Write a comment..."
            required
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            rows={3}
          />
          <Button type="submit" loading={commentLoading} size="sm">
            {commentLoading ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </div>
    </div>
  );
}
