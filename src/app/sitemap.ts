import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url;
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/report`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/claims`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
  ];
}
