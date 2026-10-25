import { db } from "@/lib/db";
import { localAUtc, sumarDias } from "@/lib/fechas";

// Lecturas de la agenda del panel. Siempre con el veterinariaId de la sesión (lib/tenant.ts).

export async function turnosEntre(veterinariaId: string, primerDia: string, ultimoDia: string, zona: string, profesionalId?: string) {
  const desde = localAUtc(primerDia, "00:00", zona);
  const hasta = localAUtc(sumarDias(ultimoDia, 1), "00:00", zona);
  const turnos = await db.turno.findMany({
    where: { veterinariaId, inicio: { gte: desde, lt: hasta }, ...(profesionalId ? { profesionalId } : {}) },
    orderBy: [{ inicio: "asc" }, { creadoEn: "asc" }],
    include: {
      servicio: { select: { nombre: true, duracionMin: true } },
      profesional: { select: { nombre: true } },
      cliente: { select: { nombre: true, telefono: true } },
      mascota: { select: { nombre: true, especie: true } },
      pagos: { select: { monto: true } },
    },
  });
  return turnos.map((t) => ({
    ...t,
    precioAcordado: t.precioAcordado.toString(),
    cobrado: t.pagos.reduce((suma, p) => suma + Number(p.monto), 0),
  }));
}

export type TurnoAgenda = Awaited<ReturnType<typeof turnosEntre>>[number];

/** Resumen del día: turnos (sin cancelados), pendientes de confirmar y monto cobrado (por fecha de pago). */
export async function resumenDelDia(veterinariaId: string, dia: string, zona: string, profesionalId?: string) {
  const desde = localAUtc(dia, "00:00", zona);
  const hasta = localAUtc(sumarDias(dia, 1), "00:00", zona);
  const filtroTurno = { veterinariaId, inicio: { gte: desde, lt: hasta }, ...(profesionalId ? { profesionalId } : {}) };
  const [turnos, pendientes, cobrado] = await Promise.all([
    db.turno.count({ where: { ...filtroTurno, estado: { not: "CANCELADO" } } }),
    db.turno.count({ where: { ...filtroTurno, estado: "PENDIENTE" } }),
    db.pago.aggregate({
      where: { veterinariaId, fecha: { gte: desde, lt: hasta }, ...(profesionalId ? { turno: { profesionalId } } : {}) },
      _sum: { monto: true },
    }),
  ]);
  return { turnos, pendientes, cobrado: Number(cobrado._sum.monto ?? 0) };
}

/** Reservas pendientes de confirmar que todavía no pasaron (contador de la navegación). */
export function contarPendientes(veterinariaId: string, ahora: Date) {
  return db.turno.count({ where: { veterinariaId, estado: "PENDIENTE", fin: { gte: ahora } } });
}

export function profesionalesActivos(veterinariaId: string) {
  return db.profesional.findMany({ where: { veterinariaId, activo: true }, orderBy: { nombre: "asc" }, select: { id: true, nombre: true } });
}
