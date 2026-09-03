import type { Metadata } from "next";
import Link from "next/link";
import { recoveryService } from "@/lib/domain/recovery-service";
import { ClaimsList } from "@/components/ClaimsList";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My claims",
  description:
    "View and manage your AeroOne lost property claims. Track investigation progress and arrange pickup.",
  alternates: { canonical: "/claims" },
  openGraph: {
    title: "My claims | ClaimDesk",
    url: "/claims",
  },
};

export default async function ClaimsPage() {
  const cases = await recoveryService.listCases();

  return (
    <div>
      <section className="band border-b border-[var(--border)]">
        <div className="shell py-10 sm:py-12">
          <Link
            href="/"
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--accent)]"
          >
            ← Back to home
          </Link>
          <p className="section-title mt-4">Your portal</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="page-title">My claims</h1>
              <p className="mt-2 max-w-xl text-[var(--ink-muted)]">
                Open a claim to search found items, confirm ownership, and arrange
                pickup for property linked to your AeroOne journey.
              </p>
            </div>
            <Link href="/report" className="btn btn-primary">
              Report an item
            </Link>
          </div>
        </div>
      </section>

      <section className="shell py-10">
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold text-[var(--ink)]">
            All claims
          </h2>
          <span className="text-sm text-[var(--ink-subtle)]">
            {cases.length} open
          </span>
        </div>
        <ClaimsList cases={cases} />
      </section>
    </div>
  );
}
