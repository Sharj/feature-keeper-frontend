"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  project as projectApi,
  updateTags as updateTagsApi,
  ApiError,
} from "@/lib/api";
import type { UpdateTag } from "@/types";
import { Button, Input, Card, ColorDot } from "@/components/ui";

export default function UpdatesSettingsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  // Update Tags
  const [tagList, setTagList] = useState<UpdateTag[]>([]);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#16794a");
  const [tagCreating, setTagCreating] = useState(false);
  const [tagError, setTagError] = useState("");
  const [editingTagId, setEditingTagId] = useState<number | null>(null);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    projectApi
      .get(token)
      .then((res) => {
        setTagList(res.data.update_tags || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleTagCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !newTagName.trim()) return;
    setTagCreating(true);
    setTagError("");
    try {
      const res = await updateTagsApi.create(token, {
        update_tag: { name: newTagName, color: newTagColor },
      });
      setTagList((prev) => [...prev, res.data]);
      setNewTagName("");
    } catch (err) {
      setTagError(err instanceof ApiError ? err.message : "Failed to create tag");
    } finally {
      setTagCreating(false);
    }
  }

  async function handleTagUpdate(id: number) {
    if (!token) return;
    try {
      const res = await updateTagsApi.update(token, id, {
        update_tag: { name: editTagName, color: editTagColor },
      });
      setTagList((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      setEditingTagId(null);
    } catch {
      // ignore
    }
  }

  async function handleTagDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Delete this tag?")) return;
    try {
      await updateTagsApi.delete(token, id);
      setTagList((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-serif text-lg text-ink">Updates</h2>

      <Card padding="lg">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted mb-4">Tags</h3>
        <p className="text-[13px] text-subtle mb-4">Tags can be assigned to update entries to categorize them (e.g. New, Improved, Fixed).</p>
        <div className="space-y-2 mb-4">
          {tagList.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2">
              {editingTagId === t.id ? (
                <>
                  <input
                    type="color"
                    value={editTagColor}
                    onChange={(e) => setEditTagColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-edge rounded-md bg-surface"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTagUpdate(t.id);
                      if (e.key === "Escape") setEditingTagId(null);
                    }}
                  />
                  <Button size="sm" onClick={() => handleTagUpdate(t.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTagId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <ColorDot color={t.color} size="md" />
                  <span className="flex-1 text-sm text-ink">{t.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingTagId(t.id);
                      setEditTagName(t.name);
                      setEditTagColor(t.color);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTagDelete(t.id)}
                    className="text-critical hover:text-critical"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
          {tagList.length === 0 && (
            <p className="text-sm text-muted py-2">No tags yet. Add one below.</p>
          )}
        </div>
        {tagError && (
          <p className="text-sm text-critical mb-2">{tagError}</p>
        )}
        <form onSubmit={handleTagCreate} className="flex items-end gap-3">
          <Input
            label="New tag"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="e.g. New"
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-edge p-0.5"
          />
          <Button type="submit" loading={tagCreating} size="sm">
            Add
          </Button>
        </form>
      </Card>
    </div>
  );
}
