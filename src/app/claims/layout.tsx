import type { Metadata } from "next";

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

export default function ClaimsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
