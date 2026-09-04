// Tipos de dominio de la app "Amigo Secreto Virtual".
// La tabla `clues` (pistas) JAMÁS debe tener un campo de remitente: es anónima por diseño.

export type EventStatus = "open" | "closed";

export interface EventRow {
  id: string;
  name: string;
  admin_name: string;
  admin_email: string;
  admin_token: string;
  status: EventStatus;
  join_code: string | null;
  created_at: string;
}

export interface ParticipantRow {
  id: string;
  event_id: string;
  name: string;
  email: string;
  access_token: string;
  joined_at: string;
  last_accessed_at: string | null;
}

export interface AssignmentRow {
  id: string;
  event_id: string;
  giver_id: string;
  receiver_id: string;
  created_at: string;
}

export interface ExclusionRow {
  id: string;
  event_id: string;
  participant_id: string;
  excluded_participant_id: string;
  created_at: string;
}

/** Pista anónima: nunca lleva remitente, solo destinatario y mensaje. */
export interface ClueRow {
  id: string;
  event_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

/**
 * Adjunto de imagen de una pista. Anónimo por diseño: no hay remitente ni
 * ningún campo que permita rastrear al emisor. `bucket` siempre es
 * `clue-images` y `path` sigue el patrón
 * `{eventId}/{clueId}/{attachmentId}/original.<ext>` (solo UUIDs).
 */
export interface ClueAttachmentRow {
  id: string;
  clue_id: string;
  bucket: string;
  path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}
