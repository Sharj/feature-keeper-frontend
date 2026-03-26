"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { project as projectApi } from "@/lib/api";
import { Button, Card } from "@/components/ui";

export default function DangerSettingsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();

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

  return (
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
  );
}
