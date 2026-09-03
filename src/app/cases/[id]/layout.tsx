import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Claim details",
  description:
    "Review possible matches, confirm ownership, and arrange pickup for your AeroOne lost property claim.",
  robots: { index: false, follow: false },
};

export default function CaseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
