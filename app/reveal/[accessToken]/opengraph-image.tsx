import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { isValidUuid } from "@/lib/validate";

export const alt = "Tu link de Amigo Secreto Virtual";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ACCENT = "#e8437e";
const ACCENT_LIGHT = "#fbdce8";
const BORDER = "#171412";

// Importante: esta imagen NUNCA debe mostrar a quién le regala cada
// participante (el `receiver`) — WhatsApp la genera server-side apenas
// alguien pega el link, antes de que el dueño del link lo abra. Solo se
// muestran datos genéricos (evento + nombre del participante).
export default async function Image({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const { accessToken } = await params;

  let participantName: string | undefined;
  let eventName = "Amigo Secreto Virtual";

  if (isValidUuid(accessToken)) {
    const { data: participant } = await supabaseAdmin
      .from("participants")
      .select("name, event_id")
      .eq("access_token", accessToken)
      .single();

    if (participant) {
      participantName = participant.name;
      const { data: event } = await supabaseAdmin
        .from("events")
        .select("name")
        .eq("id", participant.event_id)
        .single();
      if (event) eventName = event.name;
    }
  }

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
          🤫
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
          {eventName}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 60,
            fontWeight: 800,
            color: BORDER,
            textAlign: "center",
            maxWidth: 1000,
            lineHeight: 1.15,
          }}
        >
          {participantName ? `Hola, ${participantName} 👋` : "Tu link secreto"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 32,
            color: BORDER,
            marginTop: 24,
            opacity: 0.75,
          }}
        >
          Tocá para ver tus novedades
        </div>
      </div>
    ),
    { ...size }
  );
}
