import { describe, expect, it } from "vitest";
import { formatearDuracion, resumirHorarios, type Franja } from "./horarios";

const semanaCortada: Franja[] = [
  ...[1, 2, 3, 4, 5].flatMap((d) => [
    { diaSemana: d, desde: "09:00", hasta: "13:00" },
    { diaSemana: d, desde: "17:00", hasta: "21:00" },
  ]),
  { diaSemana: 6, desde: "09:00", hasta: "13:00" },
];

describe("resumirHorarios", () => {
  it("agrupa días seguidos con el mismo horario cortado", () => {
    expect(resumirHorarios(semanaCortada)).toEqual([
      { dias: "Lunes a viernes", horario: "9 a 13 y 17 a 21" },
      { dias: "Sábado", horario: "9 a 13" },
      { dias: "Domingo", horario: "Cerrado" },
    ]);
  });

  it("muestra minutos y une dos días con 'y'", () => {
    const franjas: Franja[] = [
      { diaSemana: 6, desde: "09:30", hasta: "13:00" },
      { diaSemana: 0, desde: "09:30", hasta: "13:00" },
    ];
    expect(resumirHorarios(franjas)).toEqual([
      { dias: "Lunes a viernes", horario: "Cerrado" },
      { dias: "Sábado y domingo", horario: "9:30 a 13" },
    ]);
  });
});

describe("formatearDuracion", () => {
  it("expresa minutos y horas", () => {
    expect(formatearDuracion(30)).toBe("30 min");
    expect(formatearDuracion(60)).toBe("1 h");
    expect(formatearDuracion(90)).toBe("1 h 30 min");
  });
});
