import { actorLabel } from "@/lib/ui/labels";
import type { Activity } from "@/lib/domain/types";

export function ActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold">Activity</h2>
      <p className="text-xs text-[var(--ink-subtle)]">
        Updates appear as your claim progresses.
      </p>
      <ol className="space-y-2">
        {activities.length === 0 ? (
          <li className="surface-lg px-4 py-3 text-sm text-[var(--ink-muted)]">
            No activity yet.
          </li>
        ) : (
          [...activities].reverse().map((a) => (
            <li key={a.id} className="surface-lg px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--ink-subtle)]">
                  {actorLabel(a.actor)}
                </span>
                <span className="text-[10px] text-[var(--ink-subtle)]">
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-snug text-[var(--ink)]">
                {a.message}
              </p>
            </li>
          ))
        )}
      </ol>
    </div>
  );
}
