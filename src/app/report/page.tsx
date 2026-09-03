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
    contactName: "",
    contactEmail: "",
    contactPhone: "",
  });

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await recoveryApi.createCase({
        ...form,
        lastKnownLocation: form.lastKnownLocation || undefined,
        contactName: form.contactName || undefined,
        contactEmail: form.contactEmail || undefined,
        contactPhone: form.contactPhone || undefined,
        actor: "human",
      });
      router.push(`/cases/${result.recoveryCaseId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit your report");
      setSubmitting(false);
    }
  }

  return (
    <div className="report-page">
      {/* Hero */}
      <section className="hero report-hero">
        <div className="hero-pattern" aria-hidden />
        <div className="hero-glow" aria-hidden />
        <div className="shell relative z-10 py-10 sm:py-16">
          <Link href="/" className="text-sm text-white/70 hover:text-white">
            ← Back to home
          </Link>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Report a lost item
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/70 sm:text-base">
            Tell us what you lost and which AeroOne flight you were on.
          </p>
        </div>
      </section>

      {/* Form — pulled up to overlap the hero fade */}
      <div className="shell relative z-10 -mt-10 max-w-lg pb-16">
        <form onSubmit={onSubmit} noValidate>
          <div className="report-card overflow-hidden rounded-2xl">

            {/* Card header accent strip */}
            <div className="h-1.5 w-full bg-[var(--navy-800)]" />

            <div className="space-y-5 px-6 py-7 sm:px-8">

              {/* Item description — most important, first */}
              <div className="space-y-1.5">
                <label className="block text-sm font-semibold text-[var(--ink)]">
                  What did you lose? <span className="text-[var(--danger)]">*</span>
                </label>
                <input
                  className="field"
                  value={form.itemDescription}
                  onChange={set("itemDescription")}
                  required
                  placeholder="e.g. black backpack, grey laptop bag, silver watch"
                  autoFocus
                />
              </div>

              {/* Flight + Date */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">
                    Flight number <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    className="field"
                    value={form.flightNumber}
                    onChange={set("flightNumber")}
                    required
                    placeholder="e.g. AO-123"
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">
                    Travel date <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    className="field"
                    type="date"
                    value={form.travelDate}
                    onChange={set("travelDate")}
                    required
                  />
                </div>
              </div>

              {/* From + To */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">
                    From <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    className="field"
                    value={form.origin}
                    onChange={set("origin")}
                    required
                    placeholder="e.g. Mumbai"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">
                    To <span className="text-[var(--danger)]">*</span>
                  </label>
                  <input
                    className="field"
                    value={form.destination}
                    onChange={set("destination")}
                    required
                    placeholder="e.g. Delhi"
                  />
                </div>
              </div>

              {/* Last known location */}
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--ink)]">
                  Where do you think you left it?{" "}
                  <span className="font-normal text-[var(--ink-subtle)]">(optional)</span>
                </label>
                <input
                  className="field"
                  value={form.lastKnownLocation}
                  onChange={set("lastKnownLocation")}
                  placeholder="e.g. aircraft seat, gate area, baggage claim belt"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--border)]" />

              {/* Contact details */}
              <div className="space-y-1">
                <p className="text-sm font-semibold text-[var(--ink)]">Contact details</p>
                <p className="text-xs text-[var(--ink-subtle)]">
                  Optional — helps us notify you when a match is found.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[var(--ink)]">
                  Full name
                </label>
                <input
                  className="field"
                  value={form.contactName}
                  onChange={set("contactName")}
                  placeholder="e.g. Priya Sharma"
                  autoComplete="name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">
                    Email
                  </label>
                  <input
                    className="field"
                    type="email"
                    value={form.contactEmail}
                    onChange={set("contactEmail")}
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[var(--ink)]">
                    Phone
                  </label>
                  <input
                    className="field"
                    type="tel"
                    value={form.contactPhone}
                    onChange={set("contactPhone")}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">
                  {error}
                </p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full !py-3 text-base"
              >
                {submitting ? "Submitting…" : "Submit report"}
              </button>

              <p className="text-center text-xs text-[var(--ink-subtle)]">
                After submit you'll be taken to your claim page to search found items.
              </p>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
