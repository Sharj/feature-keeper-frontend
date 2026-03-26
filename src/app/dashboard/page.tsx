"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { organizations, ApiError } from "@/lib/api";
import type { Organization } from "@/types";
import {
  Button,
  Input,
  Card,
  Badge,
  Modal,
  PageHeader,
  EmptyState,
} from "@/components/ui";

export default function DashboardPage() {
  const { token } = useAuth();
  const [orgs, setOrgs] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!token) return;
    organizations
      .list(token)
      .then((res) => {
        setOrgs(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setCreating(true);
    setError("");
    try {
      const res = await organizations.create(token, {
        organization: {
          name: newName,
          slug:
            newSlug ||
            newName
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/^-|-$/g, ""),
        },
      });
      setOrgs((prev) => [...prev, res.data]);
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create organization"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Your Organizations"
        description="Manage your organizations and their settings."
        actions={
          <Button onClick={() => setShowCreate(true)}>
            New Organization
          </Button>
        }
      />

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Organization"
        description="Set up a new organization to manage your feature boards."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          {error && (
            <div className="p-3 bg-critical-soft text-critical rounded-lg text-sm">
              {error}
            </div>
          )}
          <Input
            label="Name"
            required
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Acme Corp"
          />
          <Input
            label="Slug"
            value={newSlug}
            onChange={(e) => setNewSlug(e.target.value)}
            placeholder="acme-corp (auto-generated)"
            hint="Leave blank to auto-generate from the name."
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowCreate(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <div className="mt-8">
        {loading ? (
          <p className="text-muted">Loading organizations...</p>
        ) : orgs.length === 0 ? (
          <Card>
            <EmptyState
              title="No organizations yet"
              description="Create one to get started managing your feature boards."
              icon={
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 21H6a2 2 0 0 1-2-2V7l5-5h9a2 2 0 0 1 2 2v15a2 2 0 0 1-2 2Z" />
                  <path d="M9 2v5H4" />
                  <path d="M12 11v6" />
                  <path d="M9 14h6" />
                </svg>
              }
              action={
                <Button onClick={() => setShowCreate(true)}>
                  Create Organization
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {orgs.map((org) => (
              <Link
                key={org.id}
                href={`/dashboard/${org.id}`}
                className="block"
              >
                <Card variant="interactive" padding="lg">
                  <h2 className="font-serif text-lg text-ink">{org.name}</h2>
                  <p className="text-sm text-muted mt-1">/{org.slug}</p>
                  <div className="mt-3 flex items-center gap-2">
                    {org.plan && (
                      <Badge variant="info">{org.plan.name}</Badge>
                    )}
                    {org.created_at && (
                      <span className="text-xs text-faint">
                        Created{" "}
                        {new Date(org.created_at).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </span>
                    )}
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
