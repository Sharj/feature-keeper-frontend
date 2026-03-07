"use client";

import { useState, type FormEvent } from "react";
import { endUserAuth, ApiError } from "@/lib/api";
import { useEndUser } from "@/contexts/EndUserContext";

interface Props {
  orgSlug: string;
  authMode: string;
  open: boolean;
  onClose: () => void;
}

export default function EndUserAuthModal({ orgSlug, authMode, open, onClose }: Props) {
  const { setEndUser } = useEndUser();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ssoToken, setSsoToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const showEmail = authMode === "email_only" || authMode === "both";
  const showSso = authMode === "sso_only" || authMode === "both";

  async function handleEmailSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await endUserAuth.sendCode(orgSlug, { email, name });
      if (res.data.verified) {
        // Already verified — directly set
        setEndUser({ end_user_id: res.data.id, name: res.data.name, email: res.data.email });
        onClose();
      } else {
        setVerificationSent(true);
        setStep("verify");
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to send verification");
    } finally {
      setLoading(false);
    }
  }

  async function handleSsoSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await endUserAuth.sso(orgSlug, { sso_token: ssoToken });
      setEndUser({ end_user_id: res.data.id, name: res.data.name, email: res.data.email });
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "SSO authentication failed");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Sign In to Participate</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl">&times;</button>
        </div>

        {error && <div className="mb-3 p-2 bg-red-50 text-red-700 rounded text-sm">{error}</div>}

        {step === "verify" && verificationSent && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-2">A verification link has been sent to</p>
            <p className="font-semibold">{email}</p>
            <p className="text-sm text-gray-500 mt-3">Please check your email and click the verification link. You can then return here and participate.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
              Close
            </button>
          </div>
        )}

        {step === "form" && showEmail && (
          <form onSubmit={handleEmailSubmit} className="space-y-3 mb-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Sending..." : "Continue with Email"}
            </button>
          </form>
        )}

        {step === "form" && showEmail && showSso && (
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-white px-2 text-gray-400">or</span></div>
          </div>
        )}

        {step === "form" && showSso && (
          <form onSubmit={handleSsoSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">SSO Token</label>
              <input
                required
                value={ssoToken}
                onChange={(e) => setSsoToken(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Paste your SSO token"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-gray-800 text-white rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign in with SSO"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
