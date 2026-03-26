"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { publicBoard } from "@/lib/api";
import type { PublicBoard, UpdateEntry } from "@/types";
import { Badge, Card } from "@/components/ui";

const LABEL_VARIANTS: Record<string, "success" | "info" | "warning"> = {
  new: "success",
  improved: "info",
  fixed: "warning",
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PublicUpdateDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const id = Number(params.id);

  const [board, setBoard] = useState<PublicBoard | null>(null);
  const [update, setUpdate] = useState<UpdateEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    publicBoard.get(slug).then((res) => setBoard(res.data)).catch(() => {});
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    publicBoard
      .getUpdate(slug, id)
      .then((res) => setUpdate(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, id]);

  if (loading || !update) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={
        board
          ? ({ "--color-accent": board.accent_color } as React.CSSProperties)
          : undefined
      }
    >
      <div className="max-w-3xl mx-auto px-6 py-8 animate-fade-in">
        {/* Back link */}
        <Link
          href={`/${slug}/updates`}
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
          Back to updates
        </Link>

        {/* Label badge */}
        <div className="mb-3">
          <Badge variant={LABEL_VARIANTS[update.label]} size="sm">
            {update.label}
          </Badge>
        </div>

        {/* Title */}
        <h1 className="font-serif text-2xl text-ink">{update.title}</h1>

        {/* Date */}
        <p className="text-sm text-muted mt-2">
          {formatDate(update.published_at || update.created_at)}
        </p>

        {/* Cover image */}
        {update.cover_image_url && (
          <img
            src={update.cover_image_url}
            alt=""
            className="rounded-xl w-full mt-6"
          />
        )}

        {/* Body */}
        {update.body && (
          <div className="mt-6 text-subtle whitespace-pre-wrap leading-relaxed">
            {update.body}
          </div>
        )}

        {/* Related ideas */}
        {update.ideas && update.ideas.length > 0 && (
          <div className="mt-10">
            <h2 className="font-serif text-lg text-ink mb-4">
              You asked &rarr; We built
            </h2>
            <div className="space-y-3">
              {update.ideas.map((idea) => (
                <Link key={idea.id} href={`/${slug}/ideas/${idea.id}`}>
                  <Card variant="interactive" padding="sm">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">
                        {idea.title}
                      </span>
                      <span className="text-xs text-muted font-medium shrink-0 ml-3">
                        ▲ {idea.votes_count}
                      </span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
