"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicBoard, ApiError } from "@/lib/api";
import { useEndUser } from "@/contexts/EndUserContext";
import EndUserAuthModal from "@/components/public/EndUserAuthModal";
import type { Idea, Comment } from "@/types";

export default function IdeaDetailPage() {
  const params = useParams();
  const orgSlug = params.orgSlug as string;
  const boardSlug = params.boardSlug as string;
  const ideaId = Number(params.ideaId);
  const { endUserId, name: userName, clearEndUser } = useEndUser();

  const [idea, setIdea] = useState<Idea | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAuth, setShowAuth] = useState(false);
  const [boardAuthMode, setBoardAuthMode] = useState("email_only");

  // Comment form
  const [commentBody, setCommentBody] = useState("");
  const [postingComment, setPostingComment] = useState(false);

  // Edit form
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      publicBoard.getIdea(orgSlug, boardSlug, ideaId),
      publicBoard.comments(orgSlug, boardSlug, ideaId),
      publicBoard.get(orgSlug, boardSlug),
    ]).then(([ideaRes, commentsRes, boardRes]) => {
      setIdea(ideaRes.data);
      setEditTitle(ideaRes.data.title);
      setEditDesc(ideaRes.data.description);
      setComments(Array.isArray(commentsRes.data) ? commentsRes.data : []);
      setBoardAuthMode((boardRes.data as { auth_mode?: string }).auth_mode || "email_only");
      setLoading(false);
    }).catch(() => {
      setError("Idea not found");
      setLoading(false);
    });
  }, [orgSlug, boardSlug, ideaId]);

  const hasVoted = idea?.voted_by_end_user_ids?.includes(endUserId || 0) ?? false;

  async function handleVote() {
    if (!endUserId) { setShowAuth(true); return; }
    if (!idea) return;
    try {
      const res = await publicBoard.vote(orgSlug, boardSlug, idea.id, endUserId);
      setIdea({
        ...idea,
        votes_count: res.data.votes_count,
        voted_by_end_user_ids: res.data.voted
          ? [...(idea.voted_by_end_user_ids || []), endUserId]
          : (idea.voted_by_end_user_ids || []).filter((id) => id !== endUserId),
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setShowAuth(true);
    }
  }

  async function handleComment(e: FormEvent) {
    e.preventDefault();
    if (!endUserId) { setShowAuth(true); return; }
    if (!idea) return;
    setPostingComment(true);
    try {
      const res = await publicBoard.createComment(orgSlug, boardSlug, idea.id, {
        body: commentBody,
        end_user_id: endUserId,
      });
      setComments((prev) => [...prev, res.data]);
      setCommentBody("");
      setIdea({ ...idea, comments_count: idea.comments_count + 1 });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setShowAuth(true);
      else setError(err instanceof ApiError ? err.message : "Failed to post comment");
    } finally {
      setPostingComment(false);
    }
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    if (!endUserId || !idea) return;
    setSaving(true);
    try {
      const res = await publicBoard.updateIdea(orgSlug, boardSlug, idea.id, {
        idea: { title: editTitle, description: editDesc },
        end_user_id: endUserId,
      });
      setIdea({ ...idea, title: res.data.title, description: res.data.description });
      setEditing(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update idea");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Loading...</p></div>;
  }

  if (!idea) {
    return <div className="min-h-screen flex items-center justify-center"><p className="text-red-600">{error || "Idea not found"}</p></div>;
  }

  const isAuthor = endUserId === idea.author.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/o/${orgSlug}/b/${boardSlug}`} className="text-sm text-indigo-600 hover:text-indigo-700">&larr; Back to board</Link>
          <div className="flex items-center gap-2">
            {endUserId ? (
              <>
                <span className="text-sm text-gray-600">{userName}</span>
                <button onClick={clearEndUser} className="text-xs text-gray-400 hover:text-gray-600">Sign out</button>
              </>
            ) : (
              <button onClick={() => setShowAuth(true)} className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">Sign in</button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex gap-5">
            {/* Vote */}
            <button
              onClick={handleVote}
              className={`flex flex-col items-center justify-center w-16 shrink-0 py-3 rounded-xl border transition ${
                hasVoted
                  ? "border-indigo-300 bg-indigo-50 text-indigo-600"
                  : "border-gray-200 hover:border-indigo-300 hover:bg-indigo-50"
              }`}
            >
              <svg className="w-5 h-5" fill={hasVoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-lg font-bold">{idea.votes_count}</span>
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {editing ? (
                <form onSubmit={handleSaveEdit} className="space-y-3">
                  <input
                    required
                    maxLength={255}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    maxLength={10000}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <button type="submit" disabled={saving} className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50">
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button type="button" onClick={() => setEditing(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancel</button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h1 className="text-xl font-bold">{idea.title}</h1>
                    {isAuthor && (
                      <button onClick={() => setEditing(true)} className="text-xs text-indigo-500 hover:text-indigo-700 shrink-0">Edit</button>
                    )}
                  </div>
                  {idea.description && (
                    <p className="text-gray-600 mt-3 whitespace-pre-wrap">{idea.description}</p>
                  )}
                </>
              )}

              <div className="flex items-center gap-2 mt-4 flex-wrap">
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
              </div>

              <div className="text-xs text-gray-400 mt-3">
                by {idea.author.name} &middot; {new Date(idea.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4">Comments ({comments.length})</h2>

          <div className="space-y-3">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`p-4 rounded-xl border ${
                  c.admin_comment
                    ? "bg-indigo-50 border-indigo-100"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {c.author.avatar_url && (
                    <img src={c.author.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <span className="text-sm font-medium">{c.author.name}</span>
                  {c.admin_comment && (
                    <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded font-medium">Admin</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
              </div>
            ))}

            {comments.length === 0 && (
              <p className="text-sm text-gray-500 py-4 text-center">No comments yet. Be the first!</p>
            )}
          </div>

          {/* Comment form */}
          <form onSubmit={handleComment} className="mt-4 flex gap-2">
            <input
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder={endUserId ? "Write a comment..." : "Sign in to comment"}
              required
              disabled={!endUserId}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-400"
            />
            <button
              type="submit"
              disabled={postingComment || !endUserId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {postingComment ? "Posting..." : "Post"}
            </button>
          </form>
        </div>
      </div>

      <EndUserAuthModal
        orgSlug={orgSlug}
        authMode={boardAuthMode}
        open={showAuth}
        onClose={() => setShowAuth(false)}
      />
    </div>
  );
}
