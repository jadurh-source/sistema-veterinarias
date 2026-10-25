import { describe, expect, it } from "vitest";
import { mensajeConfirmacion } from "./mensajes";

describe("mensajeConfirmacion", () => {
  it("arma el mensaje con el primer nombre, la fecha y la hora locales", () => {
    const texto = mensajeConfirmacion({
      cliente: "Lucía Fernández",
      mascota: "Toby",
      servicio: "Consulta clínica",
      inicio: new Date("2026-11-03T20:30:00Z"),
      veterinaria: "Huellitas",
      zona: "America/Argentina/Tucuman",
    });
    expect(texto).toBe(
      "¡Hola Lucía! Te confirmamos el turno de Toby para Consulta clínica el martes 3 de noviembre a las 17:30 en Huellitas. ¡Te esperamos! 🐾",
    );
  });
});
