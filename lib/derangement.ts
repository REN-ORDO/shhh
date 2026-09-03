// Algoritmo de sorteo: derangement (permutación sin puntos fijos) que además
// respeta exclusiones opcionales. Usa reintento aleatorio con límite de
// intentos: baraja y valida; si no es válida, reintenta.

export interface DerangementInput {
  /** IDs de los participantes a sortear. */
  participantIds: string[];
  /** Para cada participante, el conjunto de IDs que NO puede recibir. */
  exclusionsByParticipant: Map<string, Set<string>>;
  maxAttempts?: number;
}

export interface DerangementResult {
  ok: true;
  /** giverId -> receiverId */
  assignment: Map<string, string>;
}

export interface DerangementFailure {
  ok: false;
  reason: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isValidAssignment(
  givers: string[],
  receivers: string[],
  exclusionsByParticipant: Map<string, Set<string>>
): boolean {
  for (let i = 0; i < givers.length; i++) {
    const giver = givers[i];
    const receiver = receivers[i];
    if (giver === receiver) return false; // sin puntos fijos: nadie se regala a sí mismo
    const excluded = exclusionsByParticipant.get(giver);
    if (excluded?.has(receiver)) return false;
  }
  return true;
}

/**
 * Calcula un derangement válido reintentando barajados aleatorios.
 * Falla explícitamente (con motivo legible) si no encuentra una solución
 * dentro del límite de intentos, lo cual suele indicar que las exclusiones
 * hacen matemáticamente imposible el sorteo (p. ej. participante excluido de
 * todos los demás).
 */
export function computeDerangement({
  participantIds,
  exclusionsByParticipant,
  maxAttempts = 2000,
}: DerangementInput): DerangementResult | DerangementFailure {
  if (participantIds.length < 3) {
    return {
      ok: false,
      reason: "Se necesitan al menos 3 participantes para poder sortear.",
    };
  }

  // Chequeo temprano: si algún participante tiene todos los demás excluidos
  // (o solo se excluye a sí mismo disponible), es imposible.
  for (const giver of participantIds) {
    const excluded = exclusionsByParticipant.get(giver) ?? new Set();
    const possibleReceivers = participantIds.filter(
      (id) => id !== giver && !excluded.has(id)
    );
    if (possibleReceivers.length === 0) {
      return {
        ok: false,
        reason:
          "El sorteo es matemáticamente imposible: al menos un participante no tiene a quién regalarle dado las exclusiones configuradas.",
      };
    }
  }

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const receivers = shuffle(participantIds);
    if (isValidAssignment(participantIds, receivers, exclusionsByParticipant)) {
      const assignment = new Map<string, string>();
      participantIds.forEach((giver, i) => assignment.set(giver, receivers[i]));
      return { ok: true, assignment };
    }
  }

  return {
    ok: false,
    reason:
      "No se pudo generar un sorteo válido tras varios intentos. Revisá las exclusiones: probablemente sean demasiado restrictivas para la cantidad de participantes.",
  };
}
