import { describe, expect, it } from "vitest";
import { accionesDisponibles, motivoNoPermitida } from "./estados-turno";

const INICIO = new Date("2026-11-03T13:00:00Z");
const ANTES = new Date("2026-11-03T12:00:00Z");
const DESPUES = new Date("2026-11-03T13:10:00Z");

describe("acciones por estado", () => {
  it("un pendiente se confirma, cancela o reprograma", () => {
    expect(accionesDisponibles("PENDIENTE", INICIO, ANTES)).toEqual(["CONFIRMAR", "CANCELAR", "REPROGRAMAR"]);
  });

  it("un confirmado se marca atendido, cancela o reprograma; ausente solo pasada la hora", () => {
    expect(accionesDisponibles("CONFIRMADO", INICIO, ANTES)).toEqual(["ATENDIDO", "CANCELAR", "REPROGRAMAR"]);
    expect(accionesDisponibles("CONFIRMADO", INICIO, DESPUES)).toEqual(["ATENDIDO", "AUSENTE", "CANCELAR", "REPROGRAMAR"]);
  });

  it("atendido, ausente y cancelado no tienen acciones de estado", () => {
    expect(accionesDisponibles("ATENDIDO", INICIO, DESPUES)).toEqual([]);
    expect(accionesDisponibles("AUSENTE", INICIO, DESPUES)).toEqual([]);
    expect(accionesDisponibles("CANCELADO", INICIO, DESPUES)).toEqual([]);
  });

  it("explica por qué no se puede", () => {
    expect(motivoNoPermitida("CONFIRMADO", "AUSENTE", INICIO, ANTES)).toBe(
      "Solo se puede marcar ausente una vez pasada la hora del turno.",
    );
    expect(motivoNoPermitida("CANCELADO", "CONFIRMAR", INICIO, ANTES)).toBe("Un turno cancelado no se puede confirmar.");
    expect(motivoNoPermitida("PENDIENTE", "ATENDIDO", INICIO, ANTES)).toBe("Un turno pendiente no se puede marcar atendido.");
  });
});
