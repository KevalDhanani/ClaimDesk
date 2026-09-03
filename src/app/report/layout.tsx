import type { Metadata } from "next";

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

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
