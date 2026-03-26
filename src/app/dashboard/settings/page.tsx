"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  project as projectApi,
  statuses as statusesApi,
  topics as topicsApi,
  ApiError,
} from "@/lib/api";
import type { Project, Status, Topic } from "@/types";
import {
  Button,
  Input,
  Card,
  Badge,
  PageHeader,
  ColorDot,
} from "@/components/ui";

const PRESET_COLORS = [
  "#c2410c",
  "#2563eb",
  "#16794a",
  "#7c3aed",
  "#0891b2",
  "#ea580c",
  "#d946ef",
  "#000000",
];

export default function SettingsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [proj, setProj] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  // Project form
  const [projName, setProjName] = useState("");
  const [projWebsite, setProjWebsite] = useState("");
  const [projSlug, setProjSlug] = useState("");
  const [projAccent, setProjAccent] = useState("#c2410c");
  const [projSaving, setProjSaving] = useState(false);
  const [projError, setProjError] = useState("");
  const [projSuccess, setProjSuccess] = useState("");

  // Statuses
  const [statusList, setStatusList] = useState<Status[]>([]);
  const [newStatusName, setNewStatusName] = useState("");
  const [newStatusColor, setNewStatusColor] = useState("#2563eb");
  const [statusCreating, setStatusCreating] = useState(false);
  const [statusError, setStatusError] = useState("");
  const [editingStatusId, setEditingStatusId] = useState<number | null>(null);
  const [editStatusName, setEditStatusName] = useState("");
  const [editStatusColor, setEditStatusColor] = useState("");

  // Topics
  const [topicList, setTopicList] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicColor, setNewTopicColor] = useState("#16794a");
  const [topicCreating, setTopicCreating] = useState(false);
  const [topicError, setTopicError] = useState("");
  const [editingTopicId, setEditingTopicId] = useState<number | null>(null);
  const [editTopicName, setEditTopicName] = useState("");
  const [editTopicColor, setEditTopicColor] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    projectApi
      .get(token)
      .then((res) => {
        const p = res.data;
        setProj(p);
        setProjName(p.name);
        setProjWebsite(p.website_url || "");
        setProjSlug(p.slug);
        setProjAccent(p.accent_color);
        setStatusList(p.statuses);
        setTopicList(p.topics);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  // Project update
  async function handleProjectSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setProjError("");
    setProjSuccess("");
    setProjSaving(true);
    try {
      const res = await projectApi.update(token, {
        project: {
          name: projName,
          website_url: projWebsite,
          slug: projSlug,
          accent_color: projAccent,
        },
      });
      setProj(res.data);
      setProjSuccess("Project updated successfully.");
      setTimeout(() => setProjSuccess(""), 3000);
    } catch (err) {
      setProjError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setProjSaving(false);
    }
  }

  // Status CRUD
  async function handleStatusCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !newStatusName.trim()) return;
    setStatusCreating(true);
    setStatusError("");
    try {
      const res = await statusesApi.create(token, {
        status: { name: newStatusName, color: newStatusColor },
      });
      setStatusList((prev) => [...prev, res.data]);
      setNewStatusName("");
    } catch (err) {
      setStatusError(err instanceof ApiError ? err.message : "Failed to create status");
    } finally {
      setStatusCreating(false);
    }
  }

  async function handleStatusUpdate(id: number) {
    if (!token) return;
    try {
      const res = await statusesApi.update(token, id, {
        status: { name: editStatusName, color: editStatusColor },
      });
      setStatusList((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      setEditingStatusId(null);
    } catch {
      // ignore
    }
  }

  async function handleStatusDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Delete this status?")) return;
    try {
      await statusesApi.delete(token, id);
      setStatusList((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  }

  // Topic CRUD
  async function handleTopicCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !newTopicName.trim()) return;
    setTopicCreating(true);
    setTopicError("");
    try {
      const res = await topicsApi.create(token, {
        topic: { name: newTopicName, color: newTopicColor },
      });
      setTopicList((prev) => [...prev, res.data]);
      setNewTopicName("");
    } catch (err) {
      setTopicError(err instanceof ApiError ? err.message : "Failed to create topic");
    } finally {
      setTopicCreating(false);
    }
  }

  async function handleTopicUpdate(id: number) {
    if (!token) return;
    try {
      const res = await topicsApi.update(token, id, {
        topic: { name: editTopicName, color: editTopicColor },
      });
      setTopicList((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      setEditingTopicId(null);
    } catch {
      // ignore
    }
  }

  async function handleTopicDelete(id: number) {
    if (!token) return;
    if (!window.confirm("Delete this topic?")) return;
    try {
      await topicsApi.delete(token, id);
      setTopicList((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // ignore
    }
  }

  // Delete project
  async function handleDeleteProject() {
    if (!token) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;
    try {
      await projectApi.delete(token);
      logout();
      router.push("/");
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
    <div className="animate-fade-in space-y-8">
      <PageHeader
        title="Settings"
        backHref="/dashboard"
        backLabel="Back to Ideas"
      />

      {/* Project settings */}
      <Card padding="lg">
        <h2 className="text-lg font-serif text-ink mb-4">Project</h2>
        <form onSubmit={handleProjectSave} className="space-y-4">
          {projError && (
            <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
              {projError}
            </div>
          )}
          {projSuccess && (
            <div className="p-3 bg-positive-soft text-positive rounded-lg text-sm">
              {projSuccess}
            </div>
          )}
          <Input
            label="Project name"
            required
            value={projName}
            onChange={(e) => setProjName(e.target.value)}
          />
          <Input
            label="Website URL"
            type="url"
            value={projWebsite}
            onChange={(e) => setProjWebsite(e.target.value)}
            placeholder="https://example.com"
          />
          <Input
            label="Board slug"
            required
            value={projSlug}
            onChange={(e) => setProjSlug(e.target.value)}
          />
          <div className="space-y-2">
            <label className="block text-sm font-medium text-ink">Accent color</label>
            <div className="flex items-center gap-2.5">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setProjAccent(color)}
                  className={`w-7 h-7 rounded-full transition-all duration-150 cursor-pointer ${
                    projAccent === color
                      ? "ring-2 ring-offset-2 ring-ink scale-110"
                      : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
              <label className="relative cursor-pointer">
                <input
                  type="color"
                  value={projAccent}
                  onChange={(e) => setProjAccent(e.target.value)}
                  className="absolute inset-0 w-7 h-7 opacity-0 cursor-pointer"
                />
                <div
                  className={`w-7 h-7 rounded-full border-2 border-dashed border-edge-strong flex items-center justify-center ${
                    !PRESET_COLORS.includes(projAccent)
                      ? "ring-2 ring-offset-2 ring-ink scale-110"
                      : ""
                  }`}
                  style={
                    !PRESET_COLORS.includes(projAccent)
                      ? { backgroundColor: projAccent }
                      : undefined
                  }
                >
                  {PRESET_COLORS.includes(projAccent) && (
                    <svg className="w-3.5 h-3.5 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </div>
              </label>
            </div>
          </div>
          <Button type="submit" loading={projSaving}>
            {projSaving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>

      {/* Statuses */}
      <Card padding="lg">
        <h2 className="text-lg font-serif text-ink mb-4">Statuses</h2>
        <div className="space-y-2 mb-4">
          {statusList.map((s) => (
            <div key={s.id} className="flex items-center gap-3 py-2">
              {editingStatusId === s.id ? (
                <>
                  <input
                    type="color"
                    value={editStatusColor}
                    onChange={(e) => setEditStatusColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={editStatusName}
                    onChange={(e) => setEditStatusName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-edge rounded-md bg-surface"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleStatusUpdate(s.id);
                      if (e.key === "Escape") setEditingStatusId(null);
                    }}
                  />
                  <Button size="sm" onClick={() => handleStatusUpdate(s.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingStatusId(null)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <ColorDot color={s.color} size="md" />
                  <span className="flex-1 text-sm text-ink">{s.name}</span>
                  {s.is_default && (
                    <Badge variant="info" size="sm">
                      default
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingStatusId(s.id);
                      setEditStatusName(s.name);
                      setEditStatusColor(s.color);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleStatusDelete(s.id)}
                    className="text-critical hover:text-critical"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
        {statusError && (
          <p className="text-sm text-critical mb-2">{statusError}</p>
        )}
        <form onSubmit={handleStatusCreate} className="flex items-end gap-3">
          <Input
            label="New status"
            value={newStatusName}
            onChange={(e) => setNewStatusName(e.target.value)}
            placeholder="e.g. In Review"
          />
          <input
            type="color"
            value={newStatusColor}
            onChange={(e) => setNewStatusColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-edge p-0.5"
          />
          <Button type="submit" loading={statusCreating} size="sm">
            Add
          </Button>
        </form>
      </Card>

      {/* Topics */}
      <Card padding="lg">
        <h2 className="text-lg font-serif text-ink mb-4">Topics</h2>
        <div className="space-y-2 mb-4">
          {topicList.map((t) => (
            <div key={t.id} className="flex items-center gap-3 py-2">
              {editingTopicId === t.id ? (
                <>
                  <input
                    type="color"
                    value={editTopicColor}
                    onChange={(e) => setEditTopicColor(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer border-0 p-0"
                  />
                  <input
                    type="text"
                    value={editTopicName}
                    onChange={(e) => setEditTopicName(e.target.value)}
                    className="flex-1 px-2 py-1 text-sm border border-edge rounded-md bg-surface"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTopicUpdate(t.id);
                      if (e.key === "Escape") setEditingTopicId(null);
                    }}
                  />
                  <Button size="sm" onClick={() => handleTopicUpdate(t.id)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setEditingTopicId(null)}
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
                      setEditingTopicId(t.id);
                      setEditTopicName(t.name);
                      setEditTopicColor(t.color);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTopicDelete(t.id)}
                    className="text-critical hover:text-critical"
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>
        {topicError && (
          <p className="text-sm text-critical mb-2">{topicError}</p>
        )}
        <form onSubmit={handleTopicCreate} className="flex items-end gap-3">
          <Input
            label="New topic"
            value={newTopicName}
            onChange={(e) => setNewTopicName(e.target.value)}
            placeholder="e.g. UX"
          />
          <input
            type="color"
            value={newTopicColor}
            onChange={(e) => setNewTopicColor(e.target.value)}
            className="w-10 h-10 rounded cursor-pointer border border-edge p-0.5"
          />
          <Button type="submit" loading={topicCreating} size="sm">
            Add
          </Button>
        </form>
      </Card>

      {/* Plan */}
      <Card padding="lg">
        <h2 className="text-lg font-serif text-ink mb-2">Plan</h2>
        <p className="text-ink font-medium">
          {proj?.plan?.name ?? "Basic"} &mdash; Free
        </p>
        <p className="text-sm text-subtle mt-1">
          {proj?.plan?.max_seats ?? 1} seat &middot;{" "}
          {proj?.plan?.max_ideas != null ? `${proj.plan.max_ideas} ideas` : "Unlimited ideas"}
        </p>
        <div className="mt-4">
          <span className="text-sm text-accent font-medium cursor-pointer hover:underline">
            Upgrade to Pro &#8594;
          </span>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="border-critical/30">
        <h2 className="text-lg font-serif text-critical mb-2">Danger Zone</h2>
        <p className="text-sm text-subtle mb-4">
          Permanently delete this project and all its data. This cannot be undone.
        </p>
        <Button variant="danger" onClick={handleDeleteProject}>
          Delete Project
        </Button>
      </Card>
    </div>
  );
}
