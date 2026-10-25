import type { EstadoTurno, OrigenTurno } from "@prisma/client";

// Estados del turno y qué se puede hacer en cada uno (docs/04-reglas-negocio.md, sección 3).
// Cobrar se agrega en la Etapa 8.

export type AccionTurno = "CONFIRMAR" | "ATENDIDO" | "AUSENTE" | "CANCELAR" | "REPROGRAMAR";

const PERMITIDAS: Record<EstadoTurno, AccionTurno[]> = {
  PENDIENTE: ["CONFIRMAR", "CANCELAR", "REPROGRAMAR"],
  CONFIRMADO: ["ATENDIDO", "AUSENTE", "CANCELAR", "REPROGRAMAR"],
  ATENDIDO: [],
  AUSENTE: [],
  CANCELADO: [],
};

export const ESTADO_RESULTANTE: Partial<Record<AccionTurno, EstadoTurno>> = {
  CONFIRMAR: "CONFIRMADO",
  ATENDIDO: "ATENDIDO",
  AUSENTE: "AUSENTE",
  CANCELAR: "CANCELADO",
};

/** Motivo por el que no se puede, o null si la acción está permitida. */
export function motivoNoPermitida(estado: EstadoTurno, accion: AccionTurno, inicio: Date, ahora: Date): string | null {
  if (!PERMITIDAS[estado].includes(accion)) {
    return `Un turno ${NOMBRE_ESTADO[estado].toLowerCase()} no se puede ${VERBO[accion]}.`;
  }
  if (accion === "AUSENTE" && ahora.getTime() < inicio.getTime()) {
    return "Solo se puede marcar ausente una vez pasada la hora del turno.";
  }
  return null;
}

/** Acciones para mostrar como botones en la agenda. */
export function accionesDisponibles(estado: EstadoTurno, inicio: Date, ahora: Date): AccionTurno[] {
  return PERMITIDAS[estado].filter((a) => motivoNoPermitida(estado, a, inicio, ahora) === null);
}

export const NOMBRE_ESTADO: Record<EstadoTurno, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  ATENDIDO: "Atendido",
  AUSENTE: "Ausente",
  CANCELADO: "Cancelado",
};

export const NOMBRE_ORIGEN: Record<OrigenTurno, string> = {
  WEB: "Web",
  MOSTRADOR: "Mostrador",
  WHATSAPP: "WhatsApp",
  TELEFONO: "Teléfono",
};

export const NOMBRE_ACCION: Record<AccionTurno, string> = {
  CONFIRMAR: "Confirmar",
  ATENDIDO: "Marcar atendido",
  AUSENTE: "Marcar ausente",
  CANCELAR: "Cancelar",
  REPROGRAMAR: "Reprogramar",
};

const VERBO: Record<AccionTurno, string> = {
  CONFIRMAR: "confirmar",
  ATENDIDO: "marcar atendido",
  AUSENTE: "marcar ausente",
  CANCELAR: "cancelar",
  REPROGRAMAR: "reprogramar",
};
