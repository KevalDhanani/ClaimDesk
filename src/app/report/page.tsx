"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { recoveryApi } from "@/lib/api/client";

export default function ReportPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    flightNumber: "",
    travelDate: "",
    origin: "",
    destination: "",
    itemDescription: "",
    lastKnownLocation: "",
  });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await recoveryApi.createCase({
        ...form,
        lastKnownLocation: form.lastKnownLocation || undefined,
        actor: "human",
      });
      router.push(`/cases/${result.recoveryCaseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your report");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <section className="hero !min-h-0">
        <div className="hero-pattern" aria-hidden />
        <div className="hero-glow" aria-hidden />
        <div className="shell relative py-10 sm:py-12">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Report a lost item
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Tell us what you lost and which AeroOne flight you were on. After you
            submit, open your claim to search found items and confirm a match.
          </p>
        </div>
      </section>

      <div className="shell max-w-3xl py-10">
        <form onSubmit={onSubmit} className="surface-lg overflow-hidden">
          <div className="border-b border-[var(--border)] bg-[var(--bg-warm)] px-6 py-4">
            <p className="text-sm font-semibold text-[var(--ink)]">
              Lost item report
            </p>
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Fields marked required help us match cabin and airport inventory.
            </p>
          </div>

          <div className="space-y-8 p-6 sm:p-8">
            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-[var(--accent)]">
                Flight details
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 sm:col-span-1">
                  <span className="text-sm font-medium">Flight number *</span>
                  <input
                    className="field"
                    value={form.flightNumber}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, flightNumber: e.target.value }))
                    }
                    required
                    placeholder="e.g. AO-123"
                    autoComplete="off"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">Travel date *</span>
                  <input
                    className="field"
                    type="date"
                    value={form.travelDate}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, travelDate: e.target.value }))
                    }
                    required
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">From *</span>
                  <input
                    className="field"
                    value={form.origin}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, origin: e.target.value }))
                    }
                    required
                    placeholder="e.g. Mumbai"
                  />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium">To *</span>
                  <input
                    className="field"
                    value={form.destination}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, destination: e.target.value }))
                    }
                    required
                    placeholder="e.g. Delhi"
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="space-y-4">
              <legend className="text-sm font-semibold text-[var(--accent)]">
                Item details
              </legend>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">What did you lose? *</span>
                <input
                  className="field"
                  value={form.itemDescription}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, itemDescription: e.target.value }))
                  }
                  required
                  placeholder="e.g. black backpack"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm font-medium">
                  Where do you think you left it? (optional)
                </span>
                <input
                  className="field"
                  value={form.lastKnownLocation}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastKnownLocation: e.target.value }))
                  }
                  placeholder="e.g. aircraft seat, gate area, baggage claim"
                />
              </label>
            </fieldset>

            {error && (
              <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-[var(--ink-subtle)]">
                After submit you’ll search found items on your claim page.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary sm:min-w-[180px]"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
