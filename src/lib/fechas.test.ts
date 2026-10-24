import { describe, expect, it } from "vitest";
import { describirDia, diaLocal, diaSemanaLocal, horaLocal, localAUtc, sumarDias } from "./fechas";

const ZONA = "America/Argentina/Tucuman"; // UTC-3, sin horario de verano

describe("fechas", () => {
  it("interpreta la hora local y la guarda en UTC", () => {
    expect(localAUtc("2026-11-03", "17:30", ZONA).toISOString()).toBe("2026-11-03T20:30:00.000Z");
  });

  it("un turno de la noche local cae al día siguiente en UTC, pero se muestra en su día", () => {
    const turno = localAUtc("2026-11-03", "21:30", ZONA);
    expect(turno.toISOString()).toBe("2026-11-04T00:30:00.000Z");
    expect(diaLocal(turno, ZONA)).toBe("2026-11-03");
    expect(horaLocal(turno, ZONA)).toBe("21:30");
    expect(diaSemanaLocal(turno, ZONA)).toBe(2); // martes
  });

  it("suma días cruzando fin de mes", () => {
    expect(sumarDias("2026-10-30", 3)).toBe("2026-11-02");
  });
});

describe("describirDia", () => {
  it("dice hoy, mañana o el día con su fecha", () => {
    expect(describirDia("2026-11-03", "2026-11-03")).toBe("hoy");
    expect(describirDia("2026-11-04", "2026-11-03")).toBe("mañana");
    expect(describirDia("2026-11-05", "2026-11-03")).toBe("jueves 5 de noviembre");
  });
});
