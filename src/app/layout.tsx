import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WebMcpBootstrap } from "@/components/WebMcpBootstrap";

const plexSans = IBM_Plex_Sans({
  variable: "--font-ui",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "ClaimDesk | AeroOne Lost Property",
  description:
    "Report and retrieve items left behind on AeroOne journeys. Match found property, confirm ownership, and arrange pickup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plexSans.variable} ${plexMono.variable} antialiased`}>
        <WebMcpBootstrap />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="w-full flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
