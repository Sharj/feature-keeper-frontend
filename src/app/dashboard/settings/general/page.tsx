"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProject } from "@/contexts/ProjectContext";
import { projects, ApiError } from "@/lib/api";
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
  const { token, projectCount, setProjectCount } = useAuth();
  const { currentProject, refreshProjects } = useProject();
  const router = useRouter();

  const [projName, setProjName] = useState("");
  const [projWebsite, setProjWebsite] = useState("");
  const [projSlug, setProjSlug] = useState("");
  const [projAccent, setProjAccent] = useState("#c2410c");
  const [projSaving, setProjSaving] = useState(false);
  const [projError, setProjError] = useState("");
  const [projSuccess, setProjSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);

  // Widget
  const [widgetSecret, setWidgetSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState("");

  useEffect(() => {
    if (!currentProject) return;
    setProjName(currentProject.name);
    setProjWebsite(currentProject.website_url || "");
    setProjSlug(currentProject.slug);
    setProjAccent(currentProject.accent_color);
    setWidgetSecret(currentProject.widget_secret || "");
  }, [currentProject]);

  async function handleProjectSave(e: FormEvent) {
    e.preventDefault();
    if (!token || !currentProject) return;
    setProjError("");
    setProjSuccess("");
    setProjSaving(true);
    try {
      await projects.update(token, currentProject.id, {
        project: {
          name: projName,
          website_url: projWebsite,
          slug: projSlug,
          accent_color: projAccent,
        },
      });
      await refreshProjects();
      setProjSuccess("Project updated successfully.");
      setTimeout(() => setProjSuccess(""), 3000);
    } catch (err) {
      setProjError(err instanceof ApiError ? err.message : "Failed to update");
    } finally {
      setProjSaving(false);
    }
  }

  async function handleRegenerateSecret() {
    if (!token || !currentProject) return;
    if (!window.confirm("Regenerate widget secret? Existing widget tokens will stop working.")) return;
    setRegenerating(true);
    try {
      const res = await projects.regenerateWidgetSecret(token, currentProject.id);
      setWidgetSecret(res.data.widget_secret);
      await refreshProjects();
    } catch {
      // ignore
    } finally {
      setRegenerating(false);
    }
  }

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(""), 2000);
    });
  }

  const embedSnippet = currentProject ? `<!-- Feature Keeper Widget -->
<script>
  window.FeatureKeeper = window.FeatureKeeper || [];
  FeatureKeeper.push({
    project: '${currentProject.slug}',
    // Optional: identify the user
    // user: { token: 'JWT_TOKEN_HERE' },
  });
</script>
<script async src="${typeof window !== 'undefined' ? window.location.origin : ''}/widget/v1/widget.js"></script>` : "";

  async function handleDeleteProject() {
    if (!token || !currentProject) return;
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    )
      return;
    setDeleting(true);
    try {
      await projects.delete(token, currentProject.id);
      await refreshProjects();
      setProjectCount(projectCount - 1);
      router.push("/dashboard");
    } catch {
      // ignore
    } finally {
      setDeleting(false);
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

      {/* Widget */}
      <h2 className="font-serif text-lg text-ink">Widget</h2>
      <Card padding="lg">
        <div className="space-y-5">
          {/* Widget Secret */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Widget Secret</label>
            <p className="text-xs text-muted mb-2">Use this secret server-side to generate JWT tokens for identified users.</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-cream border border-edge rounded-lg px-3 py-2 text-sm text-ink font-mono truncate">
                {showSecret ? (widgetSecret || "Not generated yet") : (widgetSecret ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : "Not generated yet")}
              </code>
              {widgetSecret && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? "Hide" : "Show"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => copyToClipboard(widgetSecret, "secret")}
                  >
                    {copySuccess === "secret" ? "Copied!" : "Copy"}
                  </Button>
                </>
              )}
              <Button
                variant="secondary"
                size="sm"
                loading={regenerating}
                onClick={handleRegenerateSecret}
              >
                {regenerating ? "..." : "Regenerate"}
              </Button>
            </div>
          </div>

          {/* Embed Code */}
          <div>
            <label className="block text-sm font-medium text-ink mb-1.5">Embed Code</label>
            <p className="text-xs text-muted mb-2">Add this snippet to your website to show the feedback widget.</p>
            <div className="relative">
              <pre className="bg-cream border border-edge rounded-lg p-4 text-xs text-ink font-mono overflow-x-auto whitespace-pre-wrap">
                {embedSnippet}
              </pre>
              <button
                onClick={() => copyToClipboard(embedSnippet, "embed")}
                className="absolute top-2 right-2 px-2.5 py-1 bg-surface border border-edge rounded-md text-xs text-subtle hover:text-ink hover:border-edge-strong transition-colors cursor-pointer"
              >
                {copySuccess === "embed" ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          {/* Preview link */}
          <div>
            <a
              href={`/${currentProject.slug}?widget=true`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:underline"
            >
              Preview widget &rarr;
            </a>
          </div>
        </div>
      </Card>

      {/* Delete Project */}
      <Card padding="lg" className="border-critical/30">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-critical mb-2">Delete Project</h3>
        <p className="text-sm text-subtle mb-4">
          Permanently delete this project and all its data. This cannot be undone.
        </p>
        <Button variant="danger" loading={deleting} onClick={handleDeleteProject}>
          {deleting ? "Deleting..." : "Delete Project"}
        </Button>
      </Card>
    </div>
  );
}
