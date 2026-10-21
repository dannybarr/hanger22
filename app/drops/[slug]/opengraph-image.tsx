import { ImageResponse } from "next/og";
import { getDrop } from "@/lib/data";

export const size = { width: 1080, height: 1920 };
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const drop = getDrop(slug);
  const title = drop?.title ?? "Hanger 22";
  const kicker = drop?.kicker ?? "A drop";
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
          justifyContent: "flex-end",
          padding: 80,
          fontSize: 42,
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase" }}>{kicker}</div>
        <div style={{ fontSize: 92, lineHeight: 1, marginTop: 24 }}>{title}</div>
        <div style={{ marginTop: 48, fontSize: 32 }}>Hanger 22</div>
      </div>
    ),
    size,
  );
}
