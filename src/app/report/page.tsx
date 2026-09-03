import type { Metadata } from "next";
import Link from "next/link";
import { ReportForm } from "@/components/ReportForm";

export const metadata: Metadata = {
  title: "Report a lost item",
  description:
    "Submit a lost property report for your AeroOne flight. Tell us what you lost and we'll help match it to found items.",
  alternates: { canonical: "/report" },
  openGraph: {
    title: "Report a lost item | ClaimDesk",
    url: "/report",
  },
};

export default function ReportPage() {
  return (
    <div className="report-page">
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

      <div className="shell relative z-10 -mt-10 max-w-lg pb-16">
        <ReportForm />
      </div>
    </div>
  );
}
