"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";

interface ShareInviteButtonProps {
  adminName: string;
  eventName: string;
  joinLink: string;
  joinCode: string | null;
}

/** Arma el mensaje de invitación (para WhatsApp u otro chat) y lo copia al portapapeles. */
function buildInviteMessage({
  adminName,
  eventName,
  joinLink,
  joinCode,
}: ShareInviteButtonProps): string {
  const lines = [
    `${adminName} te invitó a jugar Amigo Secreto para "${eventName}" 🎁`,
    "",
    "Entra a este link para inscribirte:",
    joinLink,
  ];

  if (joinCode) {
    lines.push(
      "",
      `Si no puedes abrir el link, entra a la página principal y escribe este código: ${joinCode}`
    );
  }

  return lines.join("\n");
}

export function ShareInviteButton(props: ShareInviteButtonProps) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      className="nb-btn nb-btn-primary px-5 py-3 flex items-center justify-center gap-2"
      onClick={async () => {
        const message = buildInviteMessage(props);
        await navigator.clipboard.writeText(message);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }}
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" />
      ) : (
        <Share2 className="size-4" aria-hidden="true" />
      )}
      {copied ? "¡Copiado!" : "Copiar mensaje de invitación"}
    </button>
  );
}
