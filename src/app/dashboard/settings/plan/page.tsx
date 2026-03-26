"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { project as projectApi } from "@/lib/api";
import type { Project } from "@/types";
import { Card } from "@/components/ui";

export default function PlanSettingsPage() {
  const { token } = useAuth();
  const [proj, setProj] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    projectApi
      .get(token)
      .then((res) => {
        setProj(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Loading settings...</p>
      </div>
    );
  }

  return (
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
  );
}
