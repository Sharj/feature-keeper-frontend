"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  project as projectApi,
  statuses as statusesApi,
  topics as topicsApi,
  updateTags as updateTagsApi,
  ApiError,
} from "@/lib/api";
import type { Project, Status, Topic, UpdateTag } from "@/types";
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

type Section = "general" | "ideas" | "updates" | "plan" | "danger";

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; group: "main" | "other" }[] = [
  {
    id: "general",
    label: "General",
    group: "main",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
  {
    id: "ideas",
    label: "Ideas",
    group: "main",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    id: "updates",
    label: "Updates",
    group: "main",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
  {
    id: "plan",
    label: "Plan",
    group: "other",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
  },
  {
    id: "danger",
    label: "Danger Zone",
    group: "other",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
];

export default function SettingsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [proj, setProj] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<Section>("general");

  // Project form
  const [projName, setProjName] = useState("");
  const [projWebsite, setProjWebsite] = useState("");
  const [projSlug, setProjSlug] = useState("");
  const [projAccent, setProjAccent] = useState("#c2410c");
  const [projRequireApproval, setProjRequireApproval] = useState(false);
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
        const p = res.data;
        setProj(p);
        setProjName(p.name);
        setProjWebsite(p.website_url || "");
        setProjSlug(p.slug);
        setProjAccent(p.accent_color);
        setProjRequireApproval(p.require_approval);
        setStatusList(p.statuses);
        setTopicList(p.topics);
        setTagList(p.update_tags || []);
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
          require_approval: projRequireApproval,
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

  // Update Tag CRUD
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

  const mainSections = SECTIONS.filter((s) => s.group === "main");
  const otherSections = SECTIONS.filter((s) => s.group === "other");

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Settings"
        backHref="/dashboard"
        backLabel="Back to Ideas"
      />

      <div className="flex gap-8 mt-6">
        {/* Sidebar */}
        <nav className="w-[200px] shrink-0 bg-surface border-r border-edge rounded-lg p-2 self-start sticky top-6">
          <div className="space-y-0.5">
            {mainSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer text-left ${
                  activeSection === s.id
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-subtle hover:text-ink hover:bg-cream"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
          <div className="border-t border-edge my-2" />
          <div className="space-y-0.5">
            {otherSections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer text-left ${
                  activeSection === s.id
                    ? "bg-accent-soft text-accent font-medium"
                    : "text-subtle hover:text-ink hover:bg-cream"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* General Section */}
          {activeSection === "general" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="font-serif text-lg text-ink">General</h2>
              <Card padding="lg">
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
            </div>
          )}

          {/* Ideas Section */}
          {activeSection === "ideas" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="font-serif text-lg text-ink">Ideas</h2>

              {/* Statuses */}
              <Card padding="lg">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted mb-4">Statuses</h3>
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
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted mb-4">Topics</h3>
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

              {/* Approval Toggle */}
              <Card padding="lg">
                <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted mb-4">Approval</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium text-ink">Require approval for public ideas</label>
                    <p className="text-[13px] text-muted mt-0.5">New ideas from public users need admin approval before they appear on the board</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={projRequireApproval}
                    onClick={async () => {
                      if (!token) return;
                      const next = !projRequireApproval;
                      setProjRequireApproval(next);
                      try {
                        await projectApi.update(token, { project: { require_approval: next } });
                      } catch {
                        setProjRequireApproval(!next);
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ${
                      projRequireApproval ? "bg-accent" : "bg-edge-strong"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ${
                        projRequireApproval ? "translate-x-5.5" : "translate-x-0.5"
                      } mt-0.5`}
                    />
                  </button>
                </div>
              </Card>
            </div>
          )}

          {/* Updates Section */}
          {activeSection === "updates" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="font-serif text-lg text-ink">Updates</h2>

              {/* Tags */}
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
          )}

          {/* Plan Section */}
          {activeSection === "plan" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="font-serif text-lg text-ink">Plan</h2>
              <Card padding="lg">
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
            </div>
          )}

          {/* Danger Zone Section */}
          {activeSection === "danger" && (
            <div className="animate-fade-in space-y-6">
              <h2 className="font-serif text-lg text-ink">Danger Zone</h2>
              <Card padding="lg" className="border-critical/30">
                <p className="text-sm text-subtle mb-4">
                  Permanently delete this project and all its data. This cannot be undone.
                </p>
                <Button variant="danger" onClick={handleDeleteProject}>
                  Delete Project
                </Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
