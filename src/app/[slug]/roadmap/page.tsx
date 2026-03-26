"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { publicBoard } from "@/lib/api";
import type { PublicBoard, RoadmapStatus } from "@/types";
import { Badge } from "@/components/ui";

export default function PublicRoadmapPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [columns, setColumns] = useState<RoadmapStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicBoard.get(slug).then((res) => setBoard(res.data)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    publicBoard
      .roadmap(slug)
      .then((res) => setColumns(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

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
            <p className="text-subtle mt-1">Help us build a better product</p>
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
              className="px-4 py-2 text-sm font-medium text-accent border-b-2 border-accent"
            >
              Roadmap
            </Link>
          </nav>
        </div>
      </header>

      {/* Kanban */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <p className="text-muted py-12 text-center">Loading roadmap...</p>
        ) : columns.length === 0 ? (
          <p className="text-muted py-12 text-center">No roadmap items yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6">
            {columns.map((col) => (
              <div
                key={col.id}
                className="min-w-[280px] w-[280px] shrink-0 bg-surface rounded-xl border border-edge overflow-hidden"
              >
                {/* Column header */}
                <div
                  className="border-t-2 px-4 py-3 flex items-center justify-between"
                  style={{ borderTopColor: col.color }}
                >
                  <h3 className="font-medium text-ink text-sm">{col.name}</h3>
                  <span className="text-xs text-muted bg-cream px-2 py-0.5 rounded-full">
                    {col.ideas.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="p-3 space-y-2">
                  {col.ideas.length === 0 && (
                    <p className="text-xs text-muted text-center py-4">
                      No ideas
                    </p>
                  )}
                  {col.ideas.map((idea, i) => (
                    <div
                      key={idea.id}
                      onClick={() => router.push(`/${slug}/ideas/${idea.id}`)}
                      className="bg-cream/60 hover:bg-cream rounded-lg p-3 cursor-pointer transition-colors animate-slide-up"
                      style={{
                        animationDelay: `${i * 40}ms`,
                        animationFillMode: "both",
                      }}
                    >
                      <h4 className="text-sm font-medium text-ink leading-snug">
                        {idea.title}
                      </h4>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs text-subtle flex items-center gap-1">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m18 15-6-6-6 6" />
                          </svg>
                          {idea.votes_count}
                        </span>
                        {idea.comments_count > 0 && (
                          <span className="text-xs text-subtle flex items-center gap-1">
                            <svg
                              width="12"
                              height="12"
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
                      {idea.topics.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {idea.topics.map((t) => (
                            <Badge key={t.id} color={t.color} size="sm">
                              {t.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
