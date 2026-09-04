import { ImageResponse } from "next/og";

export const alt = "Shhh — Amigo Secreto Virtual";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#e8437e";
const ACCENT_LIGHT = "#fbdce8";
const BORDER = "#171412";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: ACCENT_LIGHT,
          fontFamily: "sans-serif",
          padding: 64,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            width: 160,
            height: 160,
            borderRadius: 24,
            background: ACCENT,
            border: `6px solid ${BORDER}`,
            boxShadow: `12px 12px 0 0 ${BORDER}`,
            marginBottom: 48,
          }}
        >
          🎁
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 800,
            color: BORDER,
          }}
        >
          Shhh
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 36,
            color: BORDER,
            marginTop: 16,
            opacity: 0.75,
            textAlign: "center",
          }}
        >
          Amigo Secreto Virtual — sorteo automático y pistas anónimas
        </div>
      </div>
    ),
    { ...size }
  );
}
