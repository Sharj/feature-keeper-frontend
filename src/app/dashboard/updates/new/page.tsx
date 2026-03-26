"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminUpdates, adminIdeas, ApiError } from "@/lib/api";
import type { Idea } from "@/types";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  PageHeader,
} from "@/components/ui";

export default function NewUpdatePage() {
  const { token } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("new");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [ideaIds, setIdeaIds] = useState<number[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaSearch, setIdeaSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    adminIdeas.list(token, { page: "1" }).then((res) => {
      setIdeas(res.data.ideas);
    }).catch(() => {});
  }, [token]);

  function toggleIdea(id: number) {
    setIdeaIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: FormEvent, publish: boolean) {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setError("");
    setSaving(true);
    try {
      await adminUpdates.create(token, {
        title,
        body,
        label,
        cover_image_url: coverImageUrl || undefined,
        published_at: publish ? new Date().toISOString() : undefined,
        idea_ids: ideaIds.length > 0 ? ideaIds : undefined,
      });
      router.push("/dashboard/updates");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create update");
    } finally {
      setSaving(false);
    }
  }

  const filteredIdeas = ideaSearch
    ? ideas.filter((i) => i.title.toLowerCase().includes(ideaSearch.toLowerCase()))
    : ideas;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="New Update"
        backHref="/dashboard/updates"
        backLabel="Back to Updates"
      />

      <Card>
        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-5">
          {error && (
            <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's new?"
          />

          <Select
            label="Label"
            options={[
              { value: "new", label: "New" },
              { value: "improved", label: "Improved" },
              { value: "fixed", label: "Fixed" },
            ]}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
          />

          <Textarea
            label="Body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your update in markdown..."
            rows={12}
          />

          <Input
            label="Cover Image URL"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
          />

          {/* Linked Ideas */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-ink">Linked Ideas</label>
            <Input
              placeholder="Search ideas..."
              value={ideaSearch}
              onChange={(e) => setIdeaSearch(e.target.value)}
            />
            <div className="max-h-60 overflow-y-auto space-y-1 border border-edge rounded-lg p-2">
              {filteredIdeas.length === 0 ? (
                <p className="text-sm text-muted py-2 text-center">No ideas found</p>
              ) : (
                filteredIdeas.map((idea) => (
                  <label
                    key={idea.id}
                    className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-cream cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={ideaIds.includes(idea.id)}
                      onChange={() => toggleIdea(idea.id)}
                      className="accent-[var(--color-accent)]"
                    />
                    <span className="flex-1 text-sm text-ink truncate">{idea.title}</span>
                    <Badge variant="default" size="sm">{idea.votes_count}</Badge>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="secondary"
              loading={saving}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              loading={saving}
              onClick={(e) => handleSubmit(e, true)}
            >
              Publish
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
