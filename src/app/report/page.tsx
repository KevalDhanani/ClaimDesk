"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recoveryApi } from "@/lib/api/client";

export default function ReportPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    flightNumber: "AO-123",
    travelDate: "2026-09-01",
    origin: "Mumbai",
    destination: "Delhi",
    itemDescription: "black backpack",
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
      setError(err instanceof Error ? err.message : "Failed to create case");
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Report lost item</h1>
        <p className="mt-2 text-[var(--ink-muted)]">
          Open a recovery investigation. You don&apos;t need to know which desk
          holds the item — describe what happened.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-5 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-6"
      >
        {(
          [
            ["flightNumber", "Flight number"],
            ["travelDate", "Travel date"],
            ["origin", "Origin"],
            ["destination", "Destination"],
            ["itemDescription", "Item description"],
            ["lastKnownLocation", "Last known location (optional)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1.5">
            <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
            <input
              className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              required={key !== "lastKnownLocation"}
              type={key === "travelDate" ? "date" : "text"}
            />
          </label>
        ))}

        {error && (
          <p className="rounded-md bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-[var(--accent)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
        >
          {submitting ? "Opening investigation…" : "Start investigation"}
        </button>
      </form>
    </div>
  );
}
