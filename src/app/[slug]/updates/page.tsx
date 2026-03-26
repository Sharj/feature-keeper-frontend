"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicBoard } from "@/lib/api";
import type { PublicBoard, UpdateEntry, PaginationMeta } from "@/types";
import { Badge, Button, EmptyState } from "@/components/ui";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublicUpdatesPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [allUpdates, setAllUpdates] = useState<UpdateEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    publicBoard.get(slug).then((res) => setBoard(res.data)).catch(() => {});
  }, [slug]);

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const p: Record<string, string> = { page: String(page) };
      if (tagFilter !== "all") p.tag_id = tagFilter;
      const res = await publicBoard.updates(slug, p);
      setUpdates(res.data.updates);
      setMeta(res.data.meta);
      // On first load (no filter), capture all updates for tag extraction
      if (tagFilter === "all" && page === 1) {
        setAllUpdates(res.data.updates);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [slug, page, tagFilter]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  // Extract unique tags from loaded updates
  const availableTags = useMemo(() => {
    const tagMap = new Map<number, { id: number; name: string; color: string }>();
    for (const u of allUpdates) {
      if (u.tag) {
        tagMap.set(u.tag.id, u.tag);
      }
    }
    return Array.from(tagMap.values());
  }, [allUpdates]);

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
          <div>
            <h1 className="text-3xl font-serif text-ink">{board.name}</h1>
            <p className="text-subtle mt-1">What&apos;s new and improved</p>
          </div>
          <nav className="flex gap-1 mt-6 -mb-px">
            <Link
              href={`/${slug}`}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-ink border-b-2 border-transparent"
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
              className="px-4 py-2 text-sm font-medium text-accent border-b-2 border-accent"
            >
              Updates
            </Link>
          </nav>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Tag filter chips */}
        {availableTags.length > 0 && (
          <div className="flex gap-2 mb-8">
            <button
              onClick={() => {
                setTagFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                tagFilter === "all"
                  ? "bg-accent-soft text-accent font-medium"
                  : "bg-cream text-muted hover:text-subtle"
              }`}
            >
              All
            </button>
            {availableTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => {
                  setTagFilter(String(tag.id));
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${
                  tagFilter === String(tag.id)
                    ? "font-medium"
                    : "hover:opacity-80"
                }`}
                style={
                  tagFilter === String(tag.id)
                    ? { backgroundColor: `${tag.color}18`, color: tag.color }
                    : { backgroundColor: "#f5f3ef", color: "#6b7280" }
                }
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <p className="text-muted py-12 text-center">Loading updates...</p>
        ) : updates.length === 0 ? (
          <EmptyState
            title="No updates yet"
            description="Check back soon for product news"
          />
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-edge" />

            <div className="space-y-8">
              {updates.map((update, i) => (
                <div
                  key={update.id}
                  className="relative pl-10 animate-slide-up"
                  style={{
                    animationDelay: `${i * 60}ms`,
                    animationFillMode: "both",
                  }}
                >
                  {/* Timeline dot */}
                  <div
                    className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-surface"
                    style={{ backgroundColor: update.tag?.color || board.accent_color }}
                  />

                  {/* Tag badge */}
                  {update.tag && (
                    <Badge color={update.tag.color} size="sm">
                      {update.tag.name}
                    </Badge>
                  )}

                  {/* Title */}
                  <Link
                    href={`/${slug}/updates/${update.id}`}
                    className="block mt-2"
                  >
                    <h2 className="font-serif text-xl text-ink hover:text-accent transition-colors">
                      {update.title}
                    </h2>
                  </Link>

                  {/* Date */}
                  <p className="text-sm text-muted mt-1">
                    {formatDate(update.published_at || update.created_at)}
                  </p>

                  {/* Cover image */}
                  {update.cover_image_url && (
                    <img
                      src={update.cover_image_url}
                      alt=""
                      className="rounded-xl w-full mt-3"
                    />
                  )}

                  {/* Body */}
                  {update.body && (
                    <p className="text-subtle whitespace-pre-wrap mt-3 line-clamp-4">
                      {update.body}
                    </p>
                  )}

                  {/* Related ideas */}
                  {update.ideas && update.ideas.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                        Related ideas
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {update.ideas.map((idea) => (
                          <Link
                            key={idea.id}
                            href={`/${slug}/ideas/${idea.id}`}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-surface border border-edge rounded-lg text-sm text-subtle hover:text-ink hover:border-edge-strong transition-colors"
                          >
                            <span>{idea.title}</span>
                            <span className="text-xs text-muted font-medium">
                              ▲ {idea.votes_count}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pagination */}
        {meta && meta.total_pages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
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
      </div>
    </div>
  );
}
