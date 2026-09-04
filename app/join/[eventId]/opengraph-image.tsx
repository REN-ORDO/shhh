import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const alt = "Invitación a Shhh — Amigo Secreto Virtual";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#e8437e";
const ACCENT_LIGHT = "#fbdce8";
const BORDER = "#171412";

export default async function Image({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const { data: event } = await supabaseAdmin
    .from("events")
    .select("name, admin_name")
    .eq("id", eventId)
    .single();

  const eventName = event?.name ?? "Shhh — Amigo Secreto Virtual";
  const adminName = event?.admin_name;

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
            padding: "10px 28px",
            borderRadius: 999,
            background: ACCENT,
            border: `4px solid ${BORDER}`,
            fontSize: 28,
            fontWeight: 700,
            color: "white",
            marginBottom: 28,
          }}
        >
          Shhh — Amigo Secreto Virtual
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 800,
            color: BORDER,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.15,
          }}
        >
          {eventName}
        </div>
        {adminName ? (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: BORDER,
              marginTop: 24,
              opacity: 0.75,
            }}
          >
            Te invitó {adminName} · Sumate al sorteo
          </div>
        ) : null}
      </div>
    ),
    { ...size }
  );
}
