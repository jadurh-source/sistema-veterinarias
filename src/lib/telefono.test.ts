import { describe, expect, it } from "vitest";
import { normalizarNombre, normalizarTelefono } from "./telefono";

describe("normalizarTelefono", () => {
  it.each([
    ["381 555-1234", "+5493815551234"],
    ["3815551234", "+5493815551234"],
    ["0381 15 555 1234", "+5493815551234"],
    ["(0381) 155551234", "+5493815551234"],
    ["+54 9 381 555 1234", "+5493815551234"],
    ["+54 381 555 1234", "+5493815551234"],
    ["11 15 4444 5555", "+5491144445555"],
  ])("%s → %s", (entrada, esperado) => {
    expect(normalizarTelefono(entrada)).toBe(esperado);
  });

  it("rechaza números incompletos o ambiguos", () => {
    expect(normalizarTelefono("555-1234")).toBeNull();
    expect(normalizarTelefono("")).toBeNull();
    expect(normalizarTelefono("381 1515 1234")).toBeNull();
  });
});

describe("normalizarNombre", () => {
  it("ignora mayúsculas, acentos y espacios", () => {
    expect(normalizarNombre("  Simón ")).toBe(normalizarNombre("simon"));
    expect(normalizarNombre("Ñata  Gómez")).toBe("nata gomez");
  });
});
