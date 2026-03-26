"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminUpdates, adminIdeas, ApiError } from "@/lib/api";
import type { UpdateEntry, Idea } from "@/types";
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  Badge,
  PageHeader,
} from "@/components/ui";

export default function EditUpdatePage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = Number(params.id);

  const [update, setUpdate] = useState<UpdateEntry | null>(null);
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("new");
  const [body, setBody] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [ideaIds, setIdeaIds] = useState<number[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideaSearch, setIdeaSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    Promise.all([
      adminUpdates.get(token, id),
      adminIdeas.list(token, { page: "1" }),
    ]).then(([updateRes, ideasRes]) => {
      const u = updateRes.data;
      setUpdate(u);
      setTitle(u.title);
      setLabel(u.label);
      setBody(u.body || "");
      setCoverImageUrl(u.cover_image_url || "");
      setIdeaIds(u.ideas?.map((i) => i.id) || []);
      setIdeas(ideasRes.data.ideas);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [token, id]);

  function toggleIdea(ideaId: number) {
    setIdeaIds((prev) =>
      prev.includes(ideaId) ? prev.filter((i) => i !== ideaId) : [...prev, ideaId]
    );
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token || !title.trim()) return;
    setError("");
    setSaving(true);
    try {
      await adminUpdates.update(token, id, {
        title,
        body,
        label,
        cover_image_url: coverImageUrl || undefined,
        idea_ids: ideaIds,
      });
      router.push("/dashboard/updates");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save update");
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSaving(true);
    try {
      await adminUpdates.update(token, id, {
        title,
        body,
        label,
        cover_image_url: coverImageUrl || undefined,
        idea_ids: ideaIds,
      });
      await adminUpdates.publish(token, id);
      router.push("/dashboard/updates");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to publish update");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnpublish() {
    if (!token) return;
    setSaving(true);
    try {
      await adminUpdates.unpublish(token, id);
      router.push("/dashboard/updates");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to unpublish update");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!token) return;
    if (!window.confirm("Are you sure you want to delete this update?")) return;
    try {
      await adminUpdates.delete(token, id);
      router.push("/dashboard/updates");
    } catch {
      // ignore
    }
  }

  const filteredIdeas = ideaSearch
    ? ideas.filter((i) => i.title.toLowerCase().includes(ideaSearch.toLowerCase()))
    : ideas;

  if (loading) {
    return (
      <div className="animate-fade-in">
        <p className="text-muted py-8 text-center">Loading update...</p>
      </div>
    );
  }

  if (!update) {
    return (
      <div className="animate-fade-in">
        <p className="text-muted py-8 text-center">Update not found</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Edit Update"
        backHref="/dashboard/updates"
        backLabel="Back to Updates"
        actions={
          <Button variant="danger" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        }
      />

      <Card>
        <form onSubmit={handleSave} className="space-y-5">
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
            {update.published ? (
              <>
                <Button type="submit" loading={saving}>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  loading={saving}
                  onClick={handleUnpublish}
                >
                  Unpublish
                </Button>
              </>
            ) : (
              <>
                <Button type="submit" variant="secondary" loading={saving}>
                  Save Draft
                </Button>
                <Button
                  type="button"
                  loading={saving}
                  onClick={handlePublish}
                >
                  Publish
                </Button>
              </>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
}
