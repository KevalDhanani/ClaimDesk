/** Shared AO monogram badge markup for favicon / OG image generation. */
export function BrandIconMark({
  size,
  fontSize,
  borderRadius,
}: {
  size: number;
  fontSize: number;
  borderRadius: number;
}) {
  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#ffffff",
        borderRadius,
        fontSize,
        fontWeight: 800,
        color: "#0b1f38",
        letterSpacing: "-0.06em",
        boxShadow: "0 1px 3px rgba(7, 21, 38, 0.15)",
      }}
    >
      AO
    </div>
  );
}
