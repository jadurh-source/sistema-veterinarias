import type { CategoriaServicio, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { diaLocal, localAUtc, sumarDias } from "@/lib/fechas";
import {
  ANTICIPACION_WEB_MIN,
  diasConHorarios,
  horariosLibresDelDia,
  type ContextoDisponibilidad,
  type HorarioLibre,
} from "@/lib/disponibilidad";

// Lecturas para la reserva web. Nunca se cachean: la disponibilidad cambia con cada reserva.

type Cliente = Prisma.TransactionClient | typeof db;

/** Carga horarios, profesionales, turnos y bloqueos de una veterinaria entre dos días locales. */
export async function cargarContexto(
  cliente: Cliente,
  veterinaria: { id: string; zonaHoraria: string },
  primerDia: string,
  ultimoDia: string,
): Promise<ContextoDisponibilidad> {
  const desde = localAUtc(primerDia, "00:00", veterinaria.zonaHoraria);
  const hasta = localAUtc(sumarDias(ultimoDia, 1), "00:00", veterinaria.zonaHoraria);
  const veterinariaId = veterinaria.id;

  const [horarios, profesionales, turnos, bloqueos] = await Promise.all([
    cliente.horarioAtencion.findMany({ where: { veterinariaId } }),
    cliente.profesional.findMany({ where: { veterinariaId, activo: true } }),
    cliente.turno.findMany({
      where: { veterinariaId, estado: { not: "CANCELADO" }, inicio: { lt: hasta }, fin: { gt: desde } },
      select: { profesionalId: true, inicio: true, fin: true, estado: true },
    }),
    cliente.bloqueo.findMany({
      where: { veterinariaId, inicio: { lt: hasta }, fin: { gt: desde } },
      select: { profesionalId: true, inicio: true, fin: true },
    }),
  ]);

  const franja = ({ diaSemana, desde, hasta }: { diaSemana: number; desde: string; hasta: string }) => ({ diaSemana, desde, hasta });
  return {
    zona: veterinaria.zonaHoraria,
    horarioGeneral: horarios.filter((h) => h.profesionalId === null).map(franja),
    profesionales: profesionales.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      categorias: p.categorias,
      horarios: horarios.filter((h) => h.profesionalId === p.id).map(franja),
    })),
    turnos,
    bloqueos,
  };
}

/** Veterinaria activa con lo necesario para reservar. */
export function veterinariaParaReservar(slug: string) {
  return db.veterinaria.findFirst({
    where: { slug, activa: true },
    select: { id: true, slug: true, nombre: true, zonaHoraria: true, diasReservaMax: true, whatsapp: true },
  });
}

/** Desde cuándo se puede reservar en la web: ahora + 2 horas. */
export const minimoWeb = (ahora: Date) => new Date(ahora.getTime() + ANTICIPACION_WEB_MIN * 60_000);

/** Días con horarios libres para un servicio, dentro de los próximos `diasReservaMax` días. */
export async function disponibilidadWeb(
  veterinaria: { id: string; zonaHoraria: string; diasReservaMax: number },
  servicio: { categoria: CategoriaServicio; duracionMin: number },
  ahora: Date,
) {
  const hoy = diaLocal(ahora, veterinaria.zonaHoraria);
  const ultimo = sumarDias(hoy, veterinaria.diasReservaMax - 1);
  const ctx = await cargarContexto(db, veterinaria, hoy, ultimo);
  return diasConHorarios(ctx, hoy, veterinaria.diasReservaMax, servicio, minimoWeb(ahora));
}

/**
 * Para la portada: el primer horario libre de una consulta clínica (o del primer servicio
 * visible si no hay clínica), mirando los próximos 7 días.
 */
export async function proximoTurnoDisponible(slug: string, ahora: Date): Promise<HorarioLibre | null> {
  const vet = await veterinariaParaReservar(slug);
  if (!vet) return null;
  const servicios = await db.servicio.findMany({
    where: { veterinariaId: vet.id, activo: true, visibleWeb: true },
    orderBy: [{ orden: "asc" }, { nombre: "asc" }],
  });
  const servicio = servicios.find((s) => s.categoria === "CLINICA") ?? servicios[0];
  if (!servicio) return null;

  const hoy = diaLocal(ahora, vet.zonaHoraria);
  const dias = Math.min(7, vet.diasReservaMax);
  const ctx = await cargarContexto(db, vet, hoy, sumarDias(hoy, dias - 1));
  for (let i = 0; i < dias; i++) {
    const libres = horariosLibresDelDia(ctx, sumarDias(hoy, i), servicio, minimoWeb(ahora));
    if (libres.length > 0) return libres[0];
  }
  return null;
}
