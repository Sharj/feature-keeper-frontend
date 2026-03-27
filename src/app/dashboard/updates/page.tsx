"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { adminUpdates } from "@/lib/api";
import type { UpdateEntry, PaginationMeta } from "@/types";
import {
  Button,
  Card,
  Badge,
  EmptyState,
  PageHeader,
} from "@/components/ui";


type FilterTab = "all" | "published" | "drafts";

export default function UpdatesPage() {
  const { token } = useAuth();
  const { currentProject } = useProject();
  const [updates, setUpdates] = useState<UpdateEntry[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");
  const [page, setPage] = useState(1);

  const fetchUpdates = useCallback(async () => {
    if (!token || !currentProject) return;
    setLoading(true);
    try {
      const params: Record<string, string> = { page: String(page) };
      if (filter === "published") params.published = "true";
      if (filter === "drafts") params.published = "false";
      const res = await adminUpdates.list(token, currentProject.id, params);
      setUpdates(res.data.updates);
      setMeta(res.data.meta);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token, currentProject, page, filter]);

  useEffect(() => {
    fetchUpdates();
  }, [fetchUpdates]);

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Updates"
        actions={
          <Link href="/dashboard/updates/new">
            <Button>New Update</Button>
          </Link>
        }
      />

      {/* Filter tabs */}
      <div className="flex items-center gap-1 bg-cream rounded-lg p-0.5 w-fit">
        {(["all", "published", "drafts"] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer capitalize ${
              filter === f
                ? "bg-surface text-ink shadow-xs font-medium"
                : "text-muted hover:text-subtle"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Updates list */}
      {loading ? (
        <p className="text-muted py-8 text-center">Loading updates...</p>
      ) : updates.length === 0 ? (
        <Card>
          <EmptyState
            title="No updates yet"
            description="Share what you've been building"
            icon={
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            }
            action={
              <Link href="/dashboard/updates/new">
                <Button>New Update</Button>
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {updates.map((update) => {
            return (
              <Link key={update.id} href={`/dashboard/updates/${update.id}/edit`} className="block">
                <Card padding="none" className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      {update.tag && (
                        <Badge color={update.tag.color} size="sm">
                          {update.tag.name}
                        </Badge>
                      )}
                      <Badge
                        variant={update.published ? "success" : "default"}
                        size="sm"
                      >
                        {update.published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-ink">{update.title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted">
                        {formatDate(update.published ? (update.published_at || update.created_at) : update.created_at)}
                      </span>
                      {(update.ideas_count ?? 0) > 0 && (
                        <span className="text-sm text-muted">
                          {update.ideas_count} linked {update.ideas_count === 1 ? "idea" : "ideas"}
                        </span>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
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
    </div>
  );
}
