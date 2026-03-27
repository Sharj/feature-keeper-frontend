"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { account } from "@/lib/api";
import { Button, Card } from "@/components/ui";

export default function DangerSettingsPage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDeleteAccount() {
    if (!token) return;
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This will permanently delete your account, subscription, and all projects. This action cannot be undone."
      )
    )
      return;
    setDeleting(true);
    try {
      await account.delete(token);
      logout();
      router.push("/");
    } catch {
      // ignore
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-serif text-lg text-ink">Danger Zone</h2>
      <Card padding="lg" className="border-critical/30">
        <p className="text-sm text-subtle mb-4">
          This will permanently delete your account, subscription, and all projects. This action cannot be undone.
        </p>
        <Button variant="danger" loading={deleting} onClick={handleDeleteAccount}>
          {deleting ? "Deleting..." : "Delete Account"}
        </Button>
      </Card>
    </div>
  );
}
