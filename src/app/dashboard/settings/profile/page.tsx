"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { account, ApiError } from "@/lib/api";
import { Button, Input, Card } from "@/components/ui";

export default function ProfileSettingsPage() {
  const { token } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    account
      .get(token)
      .then((res) => {
        setName(res.data.name);
        setEmail(res.data.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await account.update(token, { name, email });
      setName(res.data.name);
      setEmail(res.data.email);
      setSuccess("Profile updated successfully.");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h2 className="font-serif text-lg text-ink">Profile</h2>
      <Card padding="lg">
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-positive-soft text-positive rounded-lg text-sm">
              {success}
            </div>
          )}
          <Input
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
          />
          <Button type="submit" loading={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
