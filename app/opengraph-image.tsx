import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#E9E7E2",
          color: "#4A5275",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6 }}>ZERO STOCK</div>
        <div style={{ fontSize: 92 }}>Hanger 22</div>
        <div style={{ fontSize: 28 }}>Limited editions and rare collaborations. London.</div>
      </div>
    ),
    size,
  );
}
