export const siteConfig = {
  name: "ClaimDesk",
  airline: "AeroOne",
  title: "ClaimDesk | AeroOne Lost Property",
  description:
    "Report and retrieve items left behind on AeroOne journeys. Match found property, confirm ownership, and arrange pickup.",
  keywords: [
    "AeroOne",
    "lost property",
    "lost and found",
    "airline lost items",
    "claim desk",
    "baggage recovery",
    "left on plane",
    "airport lost and found",
  ],
  url:
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"),
  locale: "en_IN",
  themeColor: "#071526",
} as const;
