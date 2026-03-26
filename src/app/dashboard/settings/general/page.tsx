"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { project as projectApi, ApiError } from "@/lib/api";
import type { Project } from "@/types";
import { Button, Input, Card } from "@/components/ui";

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

export default function GeneralSettingsPage() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);

  const [projName, setProjName] = useState("");
  const [projWebsite, setProjWebsite] = useState("");
  const [projSlug, setProjSlug] = useState("");
  const [projAccent, setProjAccent] = useState("#c2410c");
  const [projSaving, setProjSaving] = useState(false);
  const [projError, setProjError] = useState("");
  const [projSuccess, setProjSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    projectApi
      .get(token)
      .then((res) => {
        const p = res.data;
        setProjName(p.name);
        setProjWebsite(p.website_url || "");
        setProjSlug(p.slug);
        setProjAccent(p.accent_color);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleProjectSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setProjError("");
    setProjSuccess("");
    setProjSaving(true);
    try {
      await projectApi.update(token, {
        project: {
          name: projName,
          website_url: projWebsite,
          slug: projSlug,
          accent_color: projAccent,
        },
      });
      setProjSuccess("Project updated successfully.");
      setTimeout(() => setProjSuccess(""), 3000);
    } catch (err) {
      setProjError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setProjSaving(false);
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
  );
}
