import type { ReactNode } from "react";

export function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-[var(--ink)]">
        {label}
        {required ? <span className="text-[var(--danger)]"> *</span> : null}
        {hint ? (
          <span className="font-normal text-[var(--ink-subtle)]"> {hint}</span>
        ) : null}
      </label>
      {children}
    </div>
  );
}
