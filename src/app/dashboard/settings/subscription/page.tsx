"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { subscription as subscriptionApi, ApiError } from "@/lib/api";
import type { Subscription } from "@/types";
import { Button, Input, Card } from "@/components/ui";

export default function SubscriptionSettingsPage() {
  const { token } = useAuth();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [transferEmail, setTransferEmail] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    subscriptionApi
      .get(token)
      .then((res) => {
        setSub(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleTransfer(e: FormEvent) {
    e.preventDefault();
    if (!token || !transferEmail.trim()) return;
    setError("");
    setSuccess("");
    setTransferring(true);
    try {
      const res = await subscriptionApi.transfer(token, { email: transferEmail });
      setSuccess(res.data.message || "Subscription transferred successfully.");
      setTransferEmail("");
      setTimeout(() => setSuccess(""), 5000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to transfer subscription");
    } finally {
      setTransferring(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Loading subscription...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-serif text-lg text-ink">Subscription</h2>

      <Card padding="lg">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted mb-4">Current Plan</h3>
        <p className="text-ink font-medium text-lg">
          {sub?.plan?.name ?? "Basic"}
        </p>
        <div className="mt-3 space-y-1 text-sm text-subtle">
          <p>
            Ideas per project: <span className="font-medium text-ink">{sub?.plan?.max_ideas ?? "Unlimited"}</span>
          </p>
        </div>
        <div className="mt-4">
          <span className="text-sm text-accent font-medium cursor-pointer hover:underline">
            Upgrade to Pro &#8594;
          </span>
        </div>
      </Card>

      <Card padding="lg">
        <h3 className="font-sans text-sm font-semibold uppercase tracking-wider text-muted mb-4">Transfer Subscription</h3>
        <p className="text-[13px] text-subtle mb-4">
          Transfer ownership of this subscription to another user by entering their email address.
        </p>
        {error && (
          <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-positive-soft text-positive rounded-lg text-sm mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleTransfer} className="flex items-end gap-3">
          <Input
            label="Recipient email"
            type="email"
            required
            value={transferEmail}
            onChange={(e) => setTransferEmail(e.target.value)}
            placeholder="user@example.com"
          />
          <Button type="submit" loading={transferring}>
            {transferring ? "Transferring..." : "Transfer"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
