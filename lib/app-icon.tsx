import { ImageResponse } from "next/og";

/** Square, full-bleed app icon (iOS and Android mask the corners themselves). */
export function appIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #27272a 0%, #09090b 100%)",
          color: "#fafafa",
          fontSize: size * 0.5,
          fontWeight: 700,
          letterSpacing: -size * 0.01,
        }}
      >
        H
      </div>
    ),
    { width: size, height: size },
  );
}
