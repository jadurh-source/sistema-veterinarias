import type { CategoriaServicio, Especie, EspecieServicio, EstadoTurno } from "@prisma/client";
import { TZDate } from "@date-fns/tz";
import { diaLocal, diaSemanaLocal, localAUtc, sumarDias } from "@/lib/fechas";
import type { Franja } from "@/lib/horarios";

// Cálculo de horarios libres (docs/04-reglas-negocio.md, secciones 1, 2 y 7).
// Funciones puras: reciben todo lo que necesitan y no tocan la base, así se prueban solas.

/** Los horarios se ofrecen cada 30 minutos desde el inicio de cada franja. */
export const INTERVALO_MIN = 30;
/** En el sitio público no se ofrecen horarios con menos de 2 horas de anticipación. */
export const ANTICIPACION_WEB_MIN = 120;

export type ProfesionalDisponible = {
  id: string;
  nombre: string;
  categorias: CategoriaServicio[];
  /** Horario propio; si está vacío, usa el general de la veterinaria. */
  horarios: Franja[];
};

export type ContextoDisponibilidad = {
  zona: string;
  horarioGeneral: Franja[];
  profesionales: ProfesionalDisponible[];
  turnos: { profesionalId: string; inicio: Date; fin: Date; estado: EstadoTurno }[];
  /** profesionalId nulo = cierra toda la veterinaria. */
  bloqueos: { profesionalId: string | null; inicio: Date; fin: Date }[];
};

export type ServicioAReservar = { categoria: CategoriaServicio; duracionMin: number };

export type HorarioLibre = { inicio: Date; fin: Date; profesionalId: string };

const seSuperponen = (a: { inicio: Date; fin: Date }, b: { inicio: Date; fin: Date }) =>
  a.inicio.getTime() < b.fin.getTime() && b.inicio.getTime() < a.fin.getTime();

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

function aHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}

/** Sección 7: PERRO y GATO solo para su especie; TODAS para cualquiera (incluida OTRO). */
export function especieCompatible(servicio: EspecieServicio, mascota: Especie): boolean {
  return servicio === "TODAS" || servicio === mascota;
}

/**
 * Horarios libres de un día para un servicio. Cada horario trae el profesional asignado:
 * entre los libres, el que tiene menos turnos ese día (sección 2).
 * `noAntesDe`: no se ofrecen horarios que empiecen antes (ahora + anticipación en la web).
 */
export function horariosLibresDelDia(
  ctx: ContextoDisponibilidad,
  dia: string,
  servicio: ServicioAReservar,
  noAntesDe: Date,
): HorarioLibre[] {
  const diaSemana = diaSemanaLocal(localAUtc(dia, "12:00", ctx.zona), ctx.zona);
  const turnosActivos = ctx.turnos.filter((t) => t.estado !== "CANCELADO");

  // Turnos de cada profesional ese día (para asignar al que tiene menos), comparando instantes
  const inicioDia = localAUtc(dia, "00:00", ctx.zona).getTime();
  const finDia = localAUtc(sumarDias(dia, 1), "00:00", ctx.zona).getTime();
  const turnosDelDia = new Map<string, number>();
  for (const t of turnosActivos) {
    const ms = t.inicio.getTime();
    if (ms >= inicioDia && ms < finDia) turnosDelDia.set(t.profesionalId, (turnosDelDia.get(t.profesionalId) ?? 0) + 1);
  }
  const cantidad = (profesionalId: string) => turnosDelDia.get(profesionalId) ?? 0;

  const candidatos = new Map<number, ProfesionalDisponible[]>();
  // Convertir hora local a instante es lo más costoso: se hace una vez por horario, no por profesional
  const instantes = new Map<number, Date>();
  const instante = (min: number) => {
    let fecha = instantes.get(min);
    if (!fecha) instantes.set(min, (fecha = localAUtc(dia, aHora(min), ctx.zona)));
    return fecha;
  };

  for (const profesional of ctx.profesionales) {
    if (!profesional.categorias.includes(servicio.categoria)) continue;

    const horario = profesional.horarios.length > 0 ? profesional.horarios : ctx.horarioGeneral;
    const ocupado = [
      ...turnosActivos.filter((t) => t.profesionalId === profesional.id),
      ...ctx.bloqueos.filter((b) => b.profesionalId === null || b.profesionalId === profesional.id),
    ];

    for (const franja of horario.filter((f) => f.diaSemana === diaSemana)) {
      const cierre = aMinutos(franja.hasta);
      // El turno tiene que terminar dentro de la franja
      for (let min = aMinutos(franja.desde); min + servicio.duracionMin <= cierre; min += INTERVALO_MIN) {
        const inicio = instante(min);
        if (inicio.getTime() < noAntesDe.getTime()) continue;
        const fin = new Date(inicio.getTime() + servicio.duracionMin * 60_000);
        if (ocupado.some((o) => seSuperponen(o, { inicio, fin }))) continue;

        const lista = candidatos.get(inicio.getTime()) ?? [];
        lista.push(profesional);
        candidatos.set(inicio.getTime(), lista);
      }
    }
  }

  return [...candidatos.entries()]
    .sort(([a], [b]) => a - b)
    .map(([inicioMs, profesionales]) => {
      const elegido = [...profesionales].sort(
        (a, b) => cantidad(a.id) - cantidad(b.id) || a.nombre.localeCompare(b.nombre) || a.id.localeCompare(b.id),
      )[0];
      return {
        inicio: new Date(inicioMs),
        fin: new Date(inicioMs + servicio.duracionMin * 60_000),
        profesionalId: elegido.id,
      };
    });
}

/** Horarios libres de varios días seguidos, desde `primerDia`. Omite los días sin lugar. */
export function diasConHorarios(
  ctx: ContextoDisponibilidad,
  primerDia: string,
  cantidadDias: number,
  servicio: ServicioAReservar,
  noAntesDe: Date,
): { dia: string; horarios: HorarioLibre[] }[] {
  const resultado: { dia: string; horarios: HorarioLibre[] }[] = [];
  for (let i = 0; i < cantidadDias; i++) {
    const dia = sumarDias(primerDia, i);
    const horarios = horariosLibresDelDia(ctx, dia, servicio, noAntesDe);
    if (horarios.length > 0) resultado.push({ dia, horarios });
  }
  return resultado;
}

export type EvaluacionProfesional = {
  id: string;
  nombre: string;
  /** null si está libre; si no, la advertencia para mostrar en el panel. */
  problema: null | "Fuera de su horario" | "Tiene otro turno" | "Bloqueado";
};

/**
 * Para cargar un turno desde el panel en cualquier horario: evalúa cada profesional que
 * atiende la categoría. Primero los libres (el que tiene menos turnos ese día), después
 * los que tienen alguna advertencia. El panel puede cargar igual, mostrando la advertencia.
 */
export function evaluarHorario(
  ctx: ContextoDisponibilidad,
  inicio: Date,
  servicio: ServicioAReservar,
  excluirTurno?: { inicio: Date; fin: Date; profesionalId: string },
): EvaluacionProfesional[] {
  const fin = new Date(inicio.getTime() + servicio.duracionMin * 60_000);
  const turno = { inicio, fin };
  const diaSemana = diaSemanaLocal(inicio, ctx.zona);
  const minInicio = aMinutosLocal(inicio, ctx.zona);
  const minFin = minInicio + servicio.duracionMin;
  const dia = diaLocal(inicio, ctx.zona);
  const turnosActivos = ctx.turnos.filter(
    (t) =>
      t.estado !== "CANCELADO" &&
      // Al reprogramar, el turno no choca consigo mismo
      !(excluirTurno && t.profesionalId === excluirTurno.profesionalId && t.inicio.getTime() === excluirTurno.inicio.getTime()),
  );

  const evaluados = ctx.profesionales
    .filter((p) => p.categorias.includes(servicio.categoria))
    .map((p): EvaluacionProfesional & { cantidad: number } => {
      const horario = p.horarios.length > 0 ? p.horarios : ctx.horarioGeneral;
      const dentro = horario.some(
        (f) => f.diaSemana === diaSemana && aMinutos(f.desde) <= minInicio && minFin <= aMinutos(f.hasta),
      );
      const bloqueado = ctx.bloqueos.some((b) => (b.profesionalId === null || b.profesionalId === p.id) && seSuperponen(b, turno));
      const ocupado = turnosActivos.some((t) => t.profesionalId === p.id && seSuperponen(t, turno));
      const problema = bloqueado ? "Bloqueado" : ocupado ? "Tiene otro turno" : !dentro ? "Fuera de su horario" : null;
      const cantidad = turnosActivos.filter((t) => t.profesionalId === p.id && diaLocal(t.inicio, ctx.zona) === dia).length;
      return { id: p.id, nombre: p.nombre, problema, cantidad };
    });

  return evaluados
    .sort((a, b) => Number(a.problema !== null) - Number(b.problema !== null) || a.cantidad - b.cantidad || a.nombre.localeCompare(b.nombre))
    .map(({ id, nombre, problema }) => ({ id, nombre, problema }));
}

function aMinutosLocal(fecha: Date, zona: string): number {
  const local = new TZDate(fecha, zona);
  return local.getHours() * 60 + local.getMinutes();
}
