import { describe, expect, it } from "vitest";
import {
  diasConHorarios,
  evaluarHorario,
  especieCompatible,
  horariosLibresDelDia,
  type ContextoDisponibilidad,
  type ProfesionalDisponible,
} from "./disponibilidad";
import { horaLocal, localAUtc } from "./fechas";
import type { Franja } from "./horarios";

const ZONA = "America/Argentina/Tucuman";
const MARTES = "2026-11-03";
const DOMINGO = "2026-11-08";
const MEDIANOCHE = localAUtc(MARTES, "00:00", ZONA);

// Lunes a viernes 9 a 13 y 17 a 21; sábado 9 a 13
const HORARIO_GENERAL: Franja[] = [
  ...[1, 2, 3, 4, 5].flatMap((d) => [
    { diaSemana: d, desde: "09:00", hasta: "13:00" },
    { diaSemana: d, desde: "17:00", hasta: "21:00" },
  ]),
  { diaSemana: 6, desde: "09:00", hasta: "13:00" },
];

const ANA: ProfesionalDisponible = { id: "ana", nombre: "Ana", categorias: ["CLINICA", "CIRUGIA"], horarios: [] };
const PABLO: ProfesionalDisponible = { id: "pablo", nombre: "Pablo", categorias: ["CLINICA"], horarios: [] };
const SOL: ProfesionalDisponible = { id: "sol", nombre: "Sol", categorias: ["ESTETICA"], horarios: [] };

const CONSULTA = { categoria: "CLINICA", duracionMin: 30 } as const;
const CIRUGIA_90 = { categoria: "CIRUGIA", duracionMin: 90 } as const;

function contexto(cambios: Partial<ContextoDisponibilidad> = {}): ContextoDisponibilidad {
  return { zona: ZONA, horarioGeneral: HORARIO_GENERAL, profesionales: [ANA], turnos: [], bloqueos: [], ...cambios };
}

const horas = (libres: { inicio: Date }[]) => libres.map((h) => horaLocal(h.inicio, ZONA));
const turno = (profesionalId: string, desde: string, hasta: string, estado: "CONFIRMADO" | "CANCELADO" = "CONFIRMADO") => ({
  profesionalId,
  inicio: localAUtc(MARTES, desde, ZONA),
  fin: localAUtc(MARTES, hasta, ZONA),
  estado,
});

describe("horariosLibresDelDia", () => {
  it("ofrece horarios cada 30 minutos dentro del horario cortado", () => {
    const libres = horariosLibresDelDia(contexto(), MARTES, CONSULTA, MEDIANOCHE);
    expect(horas(libres)).toEqual([
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30",
    ]);
  });

  it("el turno tiene que terminar dentro de la franja: 90 minutos no se ofrecen a las 12:00", () => {
    const libres = horas(horariosLibresDelDia(contexto(), MARTES, CIRUGIA_90, MEDIANOCHE));
    expect(libres).toContain("11:30");
    expect(libres).not.toContain("12:00");
    expect(libres).not.toContain("20:00");
  });

  it("no ofrece nada un día sin horario de atención", () => {
    expect(horariosLibresDelDia(contexto(), DOMINGO, CONSULTA, MEDIANOCHE)).toEqual([]);
  });

  it("solo cuentan los profesionales que atienden la categoría del servicio", () => {
    const ctx = contexto({ profesionales: [SOL] });
    expect(horariosLibresDelDia(ctx, MARTES, CONSULTA, MEDIANOCHE)).toEqual([]);
  });

  it("un turno superpuesto ocupa al profesional; el turno contiguo no", () => {
    const ctx = contexto({ turnos: [turno("ana", "10:00", "10:30")] });
    const libres = horas(horariosLibresDelDia(ctx, MARTES, CONSULTA, MEDIANOCHE));
    expect(libres).not.toContain("10:00");
    expect(libres).toContain("09:30");
    expect(libres).toContain("10:30");
  });

  it("un servicio largo tampoco puede pisar un turno que empieza después", () => {
    const ctx = contexto({ turnos: [turno("ana", "10:00", "10:30")] });
    const libres = horas(horariosLibresDelDia(ctx, MARTES, CIRUGIA_90, MEDIANOCHE));
    expect(libres).not.toContain("09:00");
    expect(libres).not.toContain("09:30");
    expect(libres).toContain("10:30");
  });

  it("los turnos cancelados liberan el horario", () => {
    const ctx = contexto({ turnos: [turno("ana", "10:00", "10:30", "CANCELADO")] });
    expect(horas(horariosLibresDelDia(ctx, MARTES, CONSULTA, MEDIANOCHE))).toContain("10:00");
  });

  it("si un profesional está ocupado, el horario se ofrece con otro libre", () => {
    const ctx = contexto({ profesionales: [ANA, PABLO], turnos: [turno("ana", "10:00", "10:30")] });
    const diez = horariosLibresDelDia(ctx, MARTES, CONSULTA, MEDIANOCHE).find((h) => horaLocal(h.inicio, ZONA) === "10:00");
    expect(diez?.profesionalId).toBe("pablo");
  });

  it("asigna al profesional libre con menos turnos ese día", () => {
    const ctx = contexto({
      profesionales: [ANA, PABLO],
      turnos: [turno("ana", "17:00", "17:30"), turno("ana", "18:00", "18:30")],
    });
    const nueve = horariosLibresDelDia(ctx, MARTES, CONSULTA, MEDIANOCHE)[0];
    expect(nueve.profesionalId).toBe("pablo");
  });

  it("un bloqueo del profesional lo saca; un bloqueo general cierra la veterinaria", () => {
    const manana = { inicio: localAUtc(MARTES, "09:00", ZONA), fin: localAUtc(MARTES, "13:00", ZONA) };
    const soloAna = horas(horariosLibresDelDia(contexto({ bloqueos: [{ profesionalId: "ana", ...manana }] }), MARTES, CONSULTA, MEDIANOCHE));
    expect(soloAna[0]).toBe("17:00");

    const feriado = { profesionalId: null, inicio: MEDIANOCHE, fin: localAUtc("2026-11-04", "00:00", ZONA) };
    const ctx = contexto({ profesionales: [ANA, PABLO], bloqueos: [feriado] });
    expect(horariosLibresDelDia(ctx, MARTES, CONSULTA, MEDIANOCHE)).toEqual([]);
  });

  it("un profesional con horario propio atiende solo en ese horario", () => {
    const tarde: ProfesionalDisponible = { ...PABLO, horarios: [{ diaSemana: 2, desde: "15:00", hasta: "16:00" }] };
    const libres = horas(horariosLibresDelDia(contexto({ profesionales: [tarde] }), MARTES, CONSULTA, MEDIANOCHE));
    expect(libres).toEqual(["15:00", "15:30"]);
  });

  it("no ofrece horarios anteriores al mínimo (anticipación de la web)", () => {
    const ahoraMasDosHoras = localAUtc(MARTES, "12:10", ZONA);
    const libres = horas(horariosLibresDelDia(contexto(), MARTES, CONSULTA, ahoraMasDosHoras));
    expect(libres[0]).toBe("12:30");
  });
});

describe("diasConHorarios", () => {
  it("devuelve solo los días con lugar, en orden (el domingo cerrado no aparece)", () => {
    const dias = diasConHorarios(contexto(), MARTES, 7, CONSULTA, MEDIANOCHE);
    expect(dias.map((d) => d.dia)).toEqual(["2026-11-03", "2026-11-04", "2026-11-05", "2026-11-06", "2026-11-07", "2026-11-09"]);
  });
});

describe("especieCompatible", () => {
  it("un servicio para perros no se ofrece a un gato, y TODAS se ofrece a cualquiera", () => {
    expect(especieCompatible("PERRO", "PERRO")).toBe(true);
    expect(especieCompatible("PERRO", "GATO")).toBe(false);
    expect(especieCompatible("GATO", "OTRO")).toBe(false);
    expect(especieCompatible("TODAS", "OTRO")).toBe(true);
  });
});

describe("evaluarHorario (carga desde el panel)", () => {
  const diez = localAUtc(MARTES, "10:00", ZONA);

  it("los libres primero; los demás con su advertencia", () => {
    const ctx = contexto({ profesionales: [ANA, PABLO], turnos: [turno("ana", "10:00", "10:30")] });
    expect(evaluarHorario(ctx, diez, CONSULTA)).toEqual([
      { id: "pablo", nombre: "Pablo", problema: null },
      { id: "ana", nombre: "Ana", problema: "Tiene otro turno" },
    ]);
  });

  it("avisa si queda fuera de horario o hay bloqueo", () => {
    const quince = localAUtc(MARTES, "15:00", ZONA);
    expect(evaluarHorario(contexto(), quince, CONSULTA)[0].problema).toBe("Fuera de su horario");
    const ctx = contexto({ bloqueos: [{ profesionalId: "ana", inicio: MEDIANOCHE, fin: localAUtc("2026-11-04", "00:00", ZONA) }] });
    expect(evaluarHorario(ctx, diez, CONSULTA)[0].problema).toBe("Bloqueado");
  });

  it("al reprogramar, el turno no choca consigo mismo", () => {
    const propio = turno("ana", "10:00", "10:30");
    const ctx = contexto({ turnos: [propio] });
    const diezYMedia = localAUtc(MARTES, "10:00", ZONA);
    expect(evaluarHorario(ctx, diezYMedia, CONSULTA, propio)[0].problema).toBeNull();
  });
});
