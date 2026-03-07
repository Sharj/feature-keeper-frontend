"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { organizations, memberships, ApiError } from "@/lib/api";
import type { Organization, Membership } from "@/types";

export default function OrgSettingsPage() {
  const { token } = useAuth();
  const params = useParams();
  const router = useRouter();
  const orgId = Number(params.orgId);

  const [org, setOrg] = useState<Organization | null>(null);
  const [members, setMembers] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Org settings form
  const [editName, setEditName] = useState("");
  const [editAuthMode, setEditAuthMode] = useState("email_only");
  const [saving, setSaving] = useState(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviteError, setInviteError] = useState("");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      organizations.get(token, orgId),
      memberships.list(token, orgId),
    ]).then(([orgRes, membersRes]) => {
      setOrg(orgRes.data);
      setEditName(orgRes.data.name);
      setEditAuthMode(orgRes.data.auth_mode);
      setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token, orgId]);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    setError("");
    try {
      const res = await organizations.update(token, orgId, {
        organization: { name: editName, auth_mode: editAuthMode },
      });
      setOrg(res.data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleRegenerateSso() {
    if (!token || !confirm("Regenerate SSO secret? This will invalidate the current one.")) return;
    try {
      const res = await organizations.regenerateSsoSecret(token, orgId);
      setOrg((prev) => prev ? { ...prev, sso_secret: res.data.sso_secret } : prev);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to regenerate");
    }
  }

  async function handleDeleteOrg() {
    if (!token || !confirm("Delete this organization? This cannot be undone.")) return;
    try {
      await organizations.delete(token, orgId);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete");
    }
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    setInviting(true);
    setInviteError("");
    try {
      const res = await memberships.create(token, orgId, { email: inviteEmail, role: inviteRole });
      setMembers((prev) => [...prev, res.data]);
      setInviteEmail("");
    } catch (err) {
      setInviteError(err instanceof ApiError ? err.message : "Failed to invite");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(id: number) {
    if (!token || !confirm("Remove this member?")) return;
    try {
      await memberships.delete(token, orgId, id);
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to remove member");
    }
  }

  async function handleChangeRole(id: number, role: string) {
    if (!token) return;
    try {
      const res = await memberships.update(token, orgId, id, { role });
      setMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to change role");
    }
  }

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!org) return <p className="text-red-600">Organization not found.</p>;

  const showSso = editAuthMode === "sso_only" || editAuthMode === "both";

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-600">&larr;</Link>
        <h1 className="text-2xl font-bold">{org.name}</h1>
        {org.plan && <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{org.plan.name}</span>}
      </div>

      {/* Nav */}
      <div className="flex gap-4 border-b border-gray-200 pb-2">
        <span className="text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-2">Settings</span>
        <Link href={`/dashboard/${orgId}/boards`} className="text-sm text-gray-500 hover:text-gray-700 pb-2">Boards</Link>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}

      {/* Org Settings */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Organization Settings</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Auth Mode</label>
            <select
              value={editAuthMode}
              onChange={(e) => setEditAuthMode(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="email_only">Email Only</option>
              <option value="sso_only">SSO Only</option>
              <option value="both">Both</option>
            </select>
          </div>
          <button type="submit" disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </section>

      {/* SSO Secret */}
      {showSso && (
        <section className="bg-white p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-semibold mb-3">SSO Configuration</h2>
          {org.sso_secret && (
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">SSO Secret</label>
              <code className="block p-2 bg-gray-100 rounded text-xs break-all">{org.sso_secret}</code>
            </div>
          )}
          <button
            onClick={handleRegenerateSso}
            className="px-3 py-1.5 text-sm border border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50"
          >
            Regenerate Secret
          </button>
        </section>
      )}

      {/* Members */}
      <section className="bg-white p-6 rounded-xl border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Team Members</h2>

        {/* Invite form */}
        <form onSubmit={handleInvite} className="flex gap-2 mb-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="member@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="member">Member</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" disabled={inviting} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
            {inviting ? "Adding..." : "Add Member"}
          </button>
        </form>
        {inviteError && <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{inviteError}</div>}

        {/* Members list */}
        <div className="divide-y divide-gray-100">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-sm">{m.user.name}</p>
                <p className="text-xs text-gray-500">{m.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={m.role}
                  onChange={(e) => handleChangeRole(m.id, e.target.value)}
                  className="text-xs px-2 py-1 border border-gray-200 rounded"
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                  <option value="owner">Owner</option>
                </select>
                <button
                  onClick={() => handleRemoveMember(m.id)}
                  className="text-xs text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section className="bg-white p-6 rounded-xl border border-red-200">
        <h2 className="text-lg font-semibold mb-3 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-600 mb-3">
          Deleting this organization is permanent and cannot be undone.
        </p>
        <button
          onClick={handleDeleteOrg}
          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
        >
          Delete Organization
        </button>
      </section>
    </div>
  );
}
