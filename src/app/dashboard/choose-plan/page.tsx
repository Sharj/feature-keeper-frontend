"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { plans as plansApi, ApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, Button } from "@/components/ui";
import type { Plan } from "@/types";

const planFeatures: Record<string, string[]> = {
  free: [
    "Up to 5 ideas",
    "Updates changelog",
  ],
  pro: [
    "Unlimited ideas",
    "Custom domain",
    "Remove branding",
  ],
};

export default function ChoosePlanPage() {
  const router = useRouter();
  const { token, setHasSubscription, setProjectCount } = useAuth();
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    plansApi
      .list()
      .then((res) => setAvailablePlans(res.data))
      .catch(() => setError("Failed to load plans"))
      .finally(() => setLoading(false));
  }, []);

  async function handleChoose(planId: number) {
    if (!token) return;
    setChoosing(planId);
    setError("");
    try {
      await plansApi.choose(token, planId);
      setHasSubscription(true);
      setProjectCount(0);
      router.push("/dashboard/projects/new");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to select plan");
    } finally {
      setChoosing(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-muted">Loading plans...</p>
      </div>
    );
  }

  const freePlan = availablePlans.find((p) => p.slug === "free");
  const proPlan = availablePlans.find((p) => p.slug === "pro");

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-serif text-ink">Choose your plan</h1>
        <p className="mt-3 text-subtle text-base max-w-md mx-auto">
          Start free, upgrade when you need more.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-critical-soft text-critical rounded-lg text-sm max-w-lg w-full text-center">
          {error}
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-6 w-full max-w-2xl">
        {/* Free plan */}
        {freePlan && (
          <div className="animate-slide-up" style={{ animationDelay: "0ms" }}>
            <Card variant="elevated" padding="lg" className="h-full flex flex-col">
              <div className="flex-1">
                <h2 className="text-xl font-serif text-ink font-semibold">Free</h2>
                <p className="mt-1 text-2xl font-bold text-ink">
                  $0<span className="text-sm font-normal text-muted">/month</span>
                </p>
                <ul className="mt-5 space-y-2.5">
                  {(planFeatures.free).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-subtle">
                      <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                  loading={choosing === freePlan.id}
                  disabled={choosing !== null}
                  onClick={() => handleChoose(freePlan.id)}
                >
                  Get Started
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Pro plan */}
        {proPlan && (
          <div className="animate-slide-up" style={{ animationDelay: "100ms" }}>
            <Card variant="elevated" padding="lg" className="h-full flex flex-col ring-2 ring-accent">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-serif text-ink font-semibold">Pro</h2>
                  <span className="text-[10px] uppercase tracking-wider font-semibold bg-accent text-white px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                </div>
                <p className="mt-1 text-2xl font-bold text-ink">
                  $0<span className="text-sm font-normal text-muted">/month during beta</span>
                </p>
                <ul className="mt-5 space-y-2.5">
                  {(planFeatures.pro).map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-subtle">
                      <svg className="w-4 h-4 text-accent shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8">
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  loading={choosing === proPlan.id}
                  disabled={choosing !== null}
                  onClick={() => handleChoose(proPlan.id)}
                >
                  Select Pro
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
