import type { InvestigationStep } from "@/lib/domain/investigation";

const STATE_MARK: Record<InvestigationStep["state"], string> = {
  done: "✓",
  current: "●",
  pending: "○",
  blocked: "!",
};

const STATE_CLASS: Record<InvestigationStep["state"], string> = {
  done: "text-[var(--success)]",
  current: "text-[var(--accent)]",
  pending: "text-[var(--ink-subtle)]",
  blocked: "text-[var(--danger)]",
};

export function InvestigationChecklist({ steps }: { steps: InvestigationStep[] }) {
  return (
    <section className="surface-lg p-5">
      <h2 className="text-base font-semibold">Investigation status</h2>
      <p className="mt-1 text-xs text-[var(--ink-subtle)]">
        Updates from your claim activity — not a separate AI view.
      </p>
      <ol className="mt-4 space-y-1.5">
        {steps.map((step) => (
          <li
            key={step.id}
            className={`flex items-start gap-2.5 rounded px-2 py-1.5 text-sm ${
              step.state === "current"
                ? "bg-[var(--accent-soft)] ring-1 ring-[var(--accent-bright)]/30"
                : ""
            }`}
          >
            <span
              className={`mt-0.5 w-4 shrink-0 text-center text-xs font-bold ${STATE_CLASS[step.state]}`}
              aria-hidden
            >
              {STATE_MARK[step.state]}
            </span>
            <span
              className={
                step.state === "current"
                  ? "font-semibold text-[var(--accent)]"
                  : step.state === "pending"
                    ? "text-[var(--ink-subtle)]"
                    : step.state === "blocked"
                      ? "font-medium text-[var(--danger)]"
                      : "text-[var(--ink)]"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
