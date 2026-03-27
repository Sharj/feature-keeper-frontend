"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import {
  projects,
  statuses as statusesApi,
  topics as topicsApi,
  ApiError,
} from "@/lib/api";
import type { Status, Topic } from "@/types";
import { Button, Input, Card, Badge, ColorDot } from "@/components/ui";

export default function IdeasSettingsPage() {
  const { token } = useAuth();
  const { currentProject, refreshProjects } = useProject();

  // Approval
  const [projRequireApproval, setProjRequireApproval] = useState(false);

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
    if (!currentProject) return;
    setProjRequireApproval(currentProject.require_approval);
    setStatusList(currentProject.statuses);
    setTopicList(currentProject.topics);
  }, [currentProject]);

  // Status CRUD
  async function handleStatusCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !newStatusName.trim() || !currentProject) return;
    setStatusCreating(true);
    setStatusError("");
    try {
      const res = await statusesApi.create(token, currentProject.id, {
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
    if (!token || !currentProject) return;
    try {
      const res = await statusesApi.update(token, currentProject.id, id, {
        status: { name: editStatusName, color: editStatusColor },
      });
      setStatusList((prev) => prev.map((s) => (s.id === id ? res.data : s)));
      setEditingStatusId(null);
    } catch {
      // ignore
    }
  }

  async function handleStatusDelete(id: number) {
    if (!token || !currentProject) return;
    if (!window.confirm("Delete this status?")) return;
    try {
      await statusesApi.delete(token, currentProject.id, id);
      setStatusList((prev) => prev.filter((s) => s.id !== id));
    } catch {
      // ignore
    }
  }

  // Topic CRUD
  async function handleTopicCreate(e: FormEvent) {
    e.preventDefault();
    if (!token || !newTopicName.trim() || !currentProject) return;
    setTopicCreating(true);
    setTopicError("");
    try {
      const res = await topicsApi.create(token, currentProject.id, {
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
    if (!token || !currentProject) return;
    try {
      const res = await topicsApi.update(token, currentProject.id, id, {
        topic: { name: editTopicName, color: editTopicColor },
      });
      setTopicList((prev) => prev.map((t) => (t.id === id ? res.data : t)));
      setEditingTopicId(null);
    } catch {
      // ignore
    }
  }

  async function handleTopicDelete(id: number) {
    if (!token || !currentProject) return;
    if (!window.confirm("Delete this topic?")) return;
    try {
      await topicsApi.delete(token, currentProject.id, id);
      setTopicList((prev) => prev.filter((t) => t.id !== id));
    } catch {
      // ignore
    }
  }

  if (!currentProject) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
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
              if (!token || !currentProject) return;
              const next = !projRequireApproval;
              setProjRequireApproval(next);
              try {
                await projects.update(token, currentProject.id, { project: { require_approval: next } });
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
  );
}
