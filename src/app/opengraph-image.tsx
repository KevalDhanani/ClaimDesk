import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background:
            "linear-gradient(145deg, #071526 0%, #0b1f38 38%, #123356 72%, #1a557f 100%)",
          color: "#ffffff",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Subtle grid */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 24, zIndex: 1 }}>
          <div
            style={{
              width: 88,
              height: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#ffffff",
              borderRadius: 18,
              fontSize: 36,
              fontWeight: 800,
              color: "#0b1f38",
              letterSpacing: "-0.06em",
            }}
          >
            AO
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.02em" }}>
              ClaimDesk
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 500,
                letterSpacing: "0.12em",
                color: "rgba(255,255,255,0.55)",
                marginTop: 4,
              }}
            >
              AEROONE LOST PROPERTY
            </span>
          </div>
        </div>

        <p
          style={{
            maxWidth: 720,
            fontSize: 28,
            lineHeight: 1.45,
            color: "rgba(255,255,255,0.82)",
            zIndex: 1,
          }}
        >
          Report lost items, match found property, confirm ownership, and arrange pickup.
        </p>
      </div>
    ),
    { ...size }
  );
}
