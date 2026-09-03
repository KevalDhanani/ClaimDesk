"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/Field";
import { recoveryApi } from "@/lib/api/client";

export function ReportForm() {
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
    <form onSubmit={onSubmit} noValidate>
      <div className="report-card overflow-hidden rounded-2xl">
        <div className="h-1.5 w-full bg-[var(--navy-800)]" />
        <div className="space-y-5 px-6 py-7 sm:px-8">
          <Field label="What did you lose?" required>
            <input
              className="field"
              value={form.itemDescription}
              onChange={set("itemDescription")}
              required
              placeholder="e.g. black backpack, grey laptop bag, silver watch"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Flight number" required>
              <input
                className="field"
                value={form.flightNumber}
                onChange={set("flightNumber")}
                required
                placeholder="e.g. AO-123"
                autoComplete="off"
              />
            </Field>
            <Field label="Travel date" required>
              <input
                className="field"
                type="date"
                value={form.travelDate}
                onChange={set("travelDate")}
                required
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="From" required>
              <input
                className="field"
                value={form.origin}
                onChange={set("origin")}
                required
                placeholder="e.g. Mumbai"
              />
            </Field>
            <Field label="To" required>
              <input
                className="field"
                value={form.destination}
                onChange={set("destination")}
                required
                placeholder="e.g. Delhi"
              />
            </Field>
          </div>

          <Field label="Where do you think you left it?" hint="(optional)">
            <input
              className="field"
              value={form.lastKnownLocation}
              onChange={set("lastKnownLocation")}
              placeholder="e.g. aircraft seat, gate area, baggage claim belt"
            />
          </Field>

          <div className="border-t border-[var(--border)]" />

          <div className="space-y-1">
            <p className="text-sm font-semibold text-[var(--ink)]">Contact details</p>
            <p className="text-xs text-[var(--ink-subtle)]">
              Optional — helps us notify you when a match is found.
            </p>
          </div>

          <Field label="Full name">
            <input
              className="field"
              value={form.contactName}
              onChange={set("contactName")}
              placeholder="e.g. Priya Sharma"
              autoComplete="name"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input
                className="field"
                type="email"
                value={form.contactEmail}
                onChange={set("contactEmail")}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </Field>
            <Field label="Phone">
              <input
                className="field"
                type="tel"
                value={form.contactPhone}
                onChange={set("contactPhone")}
                placeholder="+91 98765 43210"
                autoComplete="tel"
              />
            </Field>
          </div>

          {error && (
            <p className="rounded-lg bg-[var(--danger-soft)] px-3 py-2.5 text-sm text-[var(--danger)]">
              {error}
            </p>
          )}

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
  );
}
