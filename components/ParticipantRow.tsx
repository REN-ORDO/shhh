"use client";

import { useActionState, useState } from "react";
import {
  removeParticipantAction,
  setExclusionsAction,
  regenerateTokenAction,
  replaceParticipantAction,
} from "@/lib/actions/participants";
import type { FormState } from "@/lib/actions/events";
import type { ParticipantRow as ParticipantRowType } from "@/lib/types";
import { ConfirmButton } from "@/components/ConfirmButton";
import { CopyField } from "@/components/CopyField";

const initialState: FormState = {};

export function ParticipantRow({
  participant,
  allParticipants,
  excludedIds,
  isOpen,
  adminToken,
  receiverName,
  origin,
}: {
  participant: ParticipantRowType;
  allParticipants: ParticipantRowType[];
  excludedIds: string[];
  isOpen: boolean;
  adminToken: string;
  receiverName?: string | null;
  origin: string;
}) {
  const [showExclusions, setShowExclusions] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [showLink, setShowLink] = useState(false);

  const [removeState, removeAction, removePending] = useActionState(
    removeParticipantAction,
    initialState
  );
  const [regenState, regenAction, regenPending] = useActionState(
    regenerateTokenAction,
    initialState
  );

  return (
    <li className="border-2 border-border rounded-lg p-4 sm:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <p className="font-bold">{participant.name}</p>
          <p className="text-sm text-muted">{participant.email}</p>
          {!isOpen && receiverName && (
            <p className="text-sm text-accent font-bold mt-1">
              → le regala a: {receiverName}
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowLink((v) => !v)}
            className="text-sm text-accent font-bold underline mt-1"
          >
            {showLink ? "Ocultar link de acceso" : "Ver link de acceso"}
          </button>
        </div>
      </div>

      {showLink && (
        <CopyField value={`${origin}/reveal/${participant.access_token}`} />
      )}

      <div className="grid grid-cols-2 gap-2">
        {isOpen && (
          <button
            type="button"
            onClick={() => setShowExclusions((v) => !v)}
            className="nb-btn nb-btn-secondary px-3 py-2 text-sm w-full"
          >
            Exclusiones
          </button>
        )}
        {isOpen && (
          <form action={removeAction}>
            <input type="hidden" name="participantId" value={participant.id} />
            <input type="hidden" name="adminToken" value={adminToken} />
            <ConfirmButton
              pending={removePending}
              pendingLabel="..."
              title="¿Eliminar participante?"
              description={`${participant.name} va a quedar fuera del evento y su link de acceso dejará de funcionar. Esta acción no se puede deshacer.`}
              confirmLabel="Sí, eliminar"
              className="nb-btn nb-btn-secondary px-3 py-2 text-sm w-full disabled:opacity-60"
            >
              Eliminar
            </ConfirmButton>
          </form>
        )}
        <form action={regenAction}>
          <input type="hidden" name="participantId" value={participant.id} />
          <input type="hidden" name="adminToken" value={adminToken} />
          <ConfirmButton
            pending={regenPending}
            pendingLabel="..."
            title="¿Regenerar link?"
            description={`El link de acceso actual de ${participant.name} va a dejar de funcionar y se va a generar uno nuevo. Después de confirmar, tocá "Ver link de acceso" para copiar el nuevo y compartírselo.`}
            confirmLabel="Sí, regenerar"
            className="nb-btn nb-btn-secondary px-3 py-2 text-sm w-full disabled:opacity-60"
          >
            Regenerar link
          </ConfirmButton>
        </form>
        <button
          type="button"
          onClick={() => setShowReplace((v) => !v)}
          className="nb-btn nb-btn-secondary px-3 py-2 text-sm w-full"
        >
          Reemplazar
        </button>
      </div>

      {removeState.error && <p className="text-accent font-bold text-sm">{removeState.error}</p>}
      {regenState.error && <p className="text-accent font-bold text-sm">{regenState.error}</p>}

      {showExclusions && isOpen && (
        <ExclusionsForm
          participant={participant}
          allParticipants={allParticipants}
          excludedIds={excludedIds}
          adminToken={adminToken}
        />
      )}

      {showReplace && (
        <ReplaceForm participant={participant} adminToken={adminToken} />
      )}
    </li>
  );
}

function ExclusionsForm({
  participant,
  allParticipants,
  excludedIds,
  adminToken,
}: {
  participant: ParticipantRowType;
  allParticipants: ParticipantRowType[];
  excludedIds: string[];
  adminToken: string;
}) {
  const [state, formAction, pending] = useActionState(
    setExclusionsAction,
    initialState
  );
  const others = allParticipants.filter((p) => p.id !== participant.id);

  return (
    <form action={formAction} className="border-t-2 border-border pt-3 flex flex-col gap-2">
      <input type="hidden" name="participantId" value={participant.id} />
      <input type="hidden" name="adminToken" value={adminToken} />
      <p className="text-sm font-bold">
        {participant.name} NO puede tocarle a:
      </p>
      <div className="flex flex-wrap gap-3">
        {others.map((o) => (
          <label key={o.id} className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              name="excludedIds"
              value={o.id}
              defaultChecked={excludedIds.includes(o.id)}
            />
            {o.name}
          </label>
        ))}
      </div>
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary px-4 py-1 text-sm self-start disabled:opacity-60">
        {pending ? "Guardando..." : "Guardar exclusiones"}
      </button>
    </form>
  );
}

function ReplaceForm({
  participant,
  adminToken,
}: {
  participant: ParticipantRowType;
  adminToken: string;
}) {
  const [state, formAction, pending] = useActionState(
    replaceParticipantAction,
    initialState
  );

  return (
    <form action={formAction} className="border-t-2 border-border pt-3 flex flex-col gap-2">
      <input type="hidden" name="participantId" value={participant.id} />
      <input type="hidden" name="adminToken" value={adminToken} />
      <input
        name="name"
        required
        placeholder="Nuevo nombre"
        className="border-2 border-border rounded-lg px-3 py-2 bg-white w-full"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="Nuevo email"
        className="border-2 border-border rounded-lg px-3 py-2 bg-white w-full"
      />
      <ConfirmButton
        pending={pending}
        pendingLabel="..."
        title="¿Reemplazar participante?"
        description={`Se va a reemplazar a ${participant.name} por los nuevos datos, manteniendo su lugar en el sorteo (mismo id). Se le va a generar un link de acceso nuevo.`}
        confirmLabel="Sí, reemplazar"
        className="nb-btn nb-btn-primary px-4 py-2 text-sm disabled:opacity-60"
      >
        Confirmar reemplazo
      </ConfirmButton>
      {state.error && <p className="text-accent font-bold text-sm">{state.error}</p>}
    </form>
  );
}
