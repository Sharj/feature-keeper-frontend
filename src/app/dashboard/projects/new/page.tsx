"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { projects, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { Card, Input, Button } from "@/components/ui";

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

function toSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

export default function NewProjectPage() {
  const router = useRouter();
  const { token, isLoading, projectCount, setProjectCount } = useAuth();
  const { refreshProjects } = useProject();
  const [name, setName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [accentColor, setAccentColor] = useState("#c2410c");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !token) {
      router.push("/login");
    }
  }, [isLoading, token, router]);

  useEffect(() => {
    if (!slugManual) {
      setSlug(toSlug(name));
    }
  }, [name, slugManual]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setLoading(true);
    try {
      await projects.create(token, {
        name,
        slug: slug || toSlug(name),
        website_url: websiteUrl || undefined,
        accent_color: accentColor,
      });
      await refreshProjects();
      setProjectCount(projectCount + 1);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || !token) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 className="text-3xl font-serif text-ink">Create a new project</h1>
          <p className="mt-2 text-subtle text-sm">Set up your feedback board in just a minute</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-critical-soft text-critical rounded-lg text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        <Card variant="elevated" padding="lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Product name"
              id="product-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Awesome Product"
            />

            <Input
              label="Website URL"
              id="website-url"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://example.com"
              hint="Optional"
            />

            <div className="space-y-1.5">
              <label htmlFor="board-slug" className="block text-sm font-medium text-ink">
                Board slug
              </label>
              <div className="flex items-center">
                <input
                  id="board-slug"
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    setSlug(toSlug(e.target.value));
                  }}
                  className="flex-1 px-3.5 py-2.5 text-sm text-ink bg-surface border border-edge rounded-l-lg placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors duration-150"
                  placeholder="my-product"
                />
                <span className="px-3.5 py-2.5 text-sm text-muted bg-cream border border-l-0 border-edge rounded-r-lg whitespace-nowrap">
                  .featurekeeper.com
                </span>
              </div>
              <p className="text-[13px] text-muted">Auto-generated from product name</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-ink">Accent color</label>
              <div className="flex items-center gap-2.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    className={`w-8 h-8 rounded-full transition-all duration-150 cursor-pointer ${
                      accentColor === color
                        ? "ring-2 ring-offset-2 ring-ink scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
                <label className="relative cursor-pointer">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                  />
                  <div
                    className={`w-8 h-8 rounded-full border-2 border-dashed border-edge-strong flex items-center justify-center transition-all duration-150 ${
                      !PRESET_COLORS.includes(accentColor)
                        ? "ring-2 ring-offset-2 ring-ink scale-110"
                        : "hover:scale-105"
                    }`}
                    style={
                      !PRESET_COLORS.includes(accentColor)
                        ? { backgroundColor: accentColor }
                        : undefined
                    }
                  >
                    {PRESET_COLORS.includes(accentColor) && (
                      <svg className="w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                </label>
              </div>
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg">
              {loading ? "Setting up..." : "Create Project"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
