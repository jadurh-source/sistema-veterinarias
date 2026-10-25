"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { accionProtegida } from "@/lib/acciones";
import { diaLocal, horaLocal, localAUtc, sumarDias } from "@/lib/fechas";
import { especieCompatible, evaluarHorario, horariosLibresDelDia, type EvaluacionProfesional } from "@/lib/disponibilidad";
import { ESTADO_RESULTANTE, motivoNoPermitida } from "@/lib/estados-turno";
import { cargarContexto } from "@/lib/reservas";
import { normalizarNombre, normalizarTelefono } from "@/lib/telefono";

// Acciones de la agenda del panel (docs/04-reglas-negocio.md, secciones 1, 3 y 6).
// Dueño y Recepción pueden hacer todo lo de la agenda.

const ROLES_AGENDA = ["DUENO", "RECEPCION"] as const;
const id = z.string().min(1);
const fechaIso = z.iso.datetime({ message: "Elegí un horario válido." });

class ErrorDeNegocio extends Error {}

/** Las acciones devuelven { error } en vez de lanzar, para mostrarlo en pantalla. */
async function conErrores<T>(fn: () => Promise<T>): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof ErrorDeNegocio) return { error: e.message };
    throw e;
  }
}

type ClienteDb = Prisma.TransactionClient | typeof db;

/** Dentro de una transacción hay que pasar su cliente: con una sola conexión, usar db se traba. */
async function veterinariaDe(veterinariaId: string, cliente: ClienteDb = db) {
  return cliente.veterinaria.findUniqueOrThrow({ where: { id: veterinariaId }, select: { id: true, zonaHoraria: true } });
}

// ─── Cambiar estado: confirmar, atendido, ausente, cancelar ─────────────────

export const cambiarEstado = accionProtegida(
  { roles: [...ROLES_AGENDA], esquema: z.object({ turnoId: id, accion: z.enum(["CONFIRMAR", "ATENDIDO", "AUSENTE", "CANCELAR"]) }) },
  async ({ turnoId, accion }, usuario) =>
    conErrores(async () => {
      await db.$transaction(async (tx) => {
        const turno = await tx.turno.findFirst({
          where: { id: turnoId, veterinariaId: usuario.veterinariaId },
          include: { servicio: { select: { revacunacionDias: true } }, veterinaria: { select: { zonaHoraria: true } } },
        });
        if (!turno) throw new ErrorDeNegocio("No encontramos ese turno.");
        const motivo = motivoNoPermitida(turno.estado, accion, turno.inicio, new Date());
        if (motivo) throw new ErrorDeNegocio(motivo);

        await tx.turno.update({ where: { id: turno.id }, data: { estado: ESTADO_RESULTANTE[accion] } });

        // Sección 6: al marcar atendido un turno de vacuna se registra la aplicación con su vencimiento
        const dias = turno.servicio.revacunacionDias;
        if (accion === "ATENDIDO" && dias) {
          const yaRegistrada = await tx.aplicacionVacuna.findFirst({ where: { turnoId: turno.id } });
          if (!yaRegistrada) {
            const fecha = diaLocal(turno.inicio, turno.veterinaria.zonaHoraria);
            await tx.aplicacionVacuna.create({
              data: {
                veterinariaId: turno.veterinariaId,
                mascotaId: turno.mascotaId,
                servicioId: turno.servicioId,
                turnoId: turno.id,
                fecha: new Date(`${fecha}T00:00:00.000Z`),
                vence: new Date(`${sumarDias(fecha, dias)}T00:00:00.000Z`),
              },
            });
          }
        }
      }, { timeout: 15_000 });
      refresh();
      return { ok: true as const };
    }),
);

// ─── Horarios para el panel ─────────────────────────────────────────────────

/** Horarios libres de un día para un servicio (sin la anticipación de la web). */
export const horariosDelDia = accionProtegida(
  { roles: [...ROLES_AGENDA], esquema: z.object({ servicioId: id, dia: z.iso.date() }) },
  async ({ servicioId, dia }, usuario) => {
    const vet = await veterinariaDe(usuario.veterinariaId);
    const servicio = await db.servicio.findFirst({ where: { id: servicioId, veterinariaId: vet.id } });
    if (!servicio) return [];
    const ctx = await cargarContexto(db, vet, dia, dia);
    return horariosLibresDelDia(ctx, dia, servicio, localAUtc(dia, "00:00", vet.zonaHoraria)).map((h) => ({
      inicio: h.inicio.toISOString(),
      hora: horaLocal(h.inicio, vet.zonaHoraria),
    }));
  },
);

/**
 * Qué profesionales pueden atender en un día y hora locales, con advertencias.
 * La hora se interpreta en la zona de la veterinaria (no en la del navegador).
 */
export const consultarHorario = accionProtegida(
  {
    roles: [...ROLES_AGENDA],
    esquema: z.object({
      servicioId: id,
      dia: z.iso.date(),
      hora: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Escribí la hora como 17:30."),
      excluirTurnoId: id.optional(),
    }),
  },
  async ({ servicioId, dia, hora, excluirTurnoId }, usuario) =>
    conErrores(async () => {
      const vet = await veterinariaDe(usuario.veterinariaId);
      const inicio = localAUtc(dia, hora, vet.zonaHoraria);
      const profesionales = await evaluar(usuario.veterinariaId, servicioId, inicio, excluirTurnoId);
      return { inicio: inicio.toISOString(), profesionales };
    }),
);

async function evaluar(veterinariaId: string, servicioId: string, inicio: Date, excluirTurnoId?: string, cliente: ClienteDb = db) {
  const vet = await veterinariaDe(veterinariaId, cliente);
  const servicio = await cliente.servicio.findFirst({ where: { id: servicioId, veterinariaId } });
  if (!servicio) throw new ErrorDeNegocio("Ese servicio no existe.");
  const excluir = excluirTurnoId ? await cliente.turno.findFirst({ where: { id: excluirTurnoId, veterinariaId } }) : null;
  const dia = diaLocal(inicio, vet.zonaHoraria);
  const ctx = await cargarContexto(cliente, vet, dia, dia);
  return evaluarHorario(ctx, inicio, servicio, excluir ?? undefined);
}

/** Si el profesional elegido tiene una advertencia y no se confirmó, se frena con el aviso. */
function advertenciaDe(evaluacion: EvaluacionProfesional[], profesionalId: string, forzar: boolean) {
  const elegido = evaluacion.find((e) => e.id === profesionalId);
  if (!elegido) throw new ErrorDeNegocio("Ese profesional no atiende este servicio.");
  if (elegido.problema && !forzar) return `${elegido.nombre}: ${elegido.problema.toLowerCase()}. ¿Cargarlo igual?`;
  return null;
}

// ─── Reprogramar ────────────────────────────────────────────────────────────

export const reprogramarTurno = accionProtegida(
  {
    roles: [...ROLES_AGENDA],
    esquema: z.object({ turnoId: id, inicio: fechaIso, profesionalId: id, forzar: z.boolean().default(false) }),
  },
  async ({ turnoId, inicio, profesionalId, forzar }, usuario) =>
    conErrores(async () => {
      const resultado = await db.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${usuario.veterinariaId}))::text`;
        const turno = await tx.turno.findFirst({
          where: { id: turnoId, veterinariaId: usuario.veterinariaId },
          include: { servicio: { select: { duracionMin: true } } },
        });
        if (!turno) throw new ErrorDeNegocio("No encontramos ese turno.");
        const motivo = motivoNoPermitida(turno.estado, "REPROGRAMAR", turno.inicio, new Date());
        if (motivo) throw new ErrorDeNegocio(motivo);

        const nuevoInicio = new Date(inicio);
        const evaluacion = await evaluar(usuario.veterinariaId, turno.servicioId, nuevoInicio, turno.id, tx);
        const advertencia = advertenciaDe(evaluacion, profesionalId, forzar);
        if (advertencia) return { advertencia };

        // Conserva el turno, su estado y su precio (sección 3)
        await tx.turno.update({
          where: { id: turno.id },
          data: { inicio: nuevoInicio, fin: new Date(nuevoInicio.getTime() + turno.servicio.duracionMin * 60_000), profesionalId },
        });
        return { ok: true as const, dia: diaLocal(nuevoInicio, (await veterinariaDe(usuario.veterinariaId, tx)).zonaHoraria) };
      }, { timeout: 15_000 });
      if ("ok" in resultado) refresh();
      return resultado;
    }),
);

// ─── Nuevo turno desde el panel ─────────────────────────────────────────────

const esquemaNuevo = z.object({
  cliente: z.union([
    z.object({ id }),
    z.object({
      nombre: z.string().trim().min(3, "Escribí el nombre y apellido del cliente.").max(80),
      telefono: z.string().trim().min(6, "Escribí el WhatsApp del cliente.").max(30),
    }),
  ]),
  mascota: z.union([
    z.object({ id }),
    z.object({
      nombre: z.string().trim().min(1, "Escribí el nombre de la mascota.").max(40),
      especie: z.enum(["PERRO", "GATO", "OTRO"]),
    }),
  ]),
  servicioId: id,
  inicio: fechaIso,
  profesionalId: id,
  origen: z.enum(["MOSTRADOR", "WHATSAPP", "TELEFONO"]),
  notasInternas: z.string().trim().max(300).optional(),
  forzar: z.boolean().default(false),
});

export const crearTurno = accionProtegida({ roles: [...ROLES_AGENDA], esquema: esquemaNuevo }, async (datos, usuario) =>
  conErrores(async () => {
    const veterinariaId = usuario.veterinariaId;
    const resultado = await db.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${veterinariaId}))::text`;

      const servicio = await tx.servicio.findFirst({ where: { id: datos.servicioId, veterinariaId, activo: true } });
      if (!servicio) throw new ErrorDeNegocio("Ese servicio no está activo.");

      // Cliente: existente o nuevo (por WhatsApp normalizado, sin duplicar)
      let clienteId: string;
      if ("id" in datos.cliente) {
        const existe = await tx.cliente.findFirst({ where: { id: datos.cliente.id, veterinariaId } });
        if (!existe) throw new ErrorDeNegocio("No encontramos ese cliente.");
        clienteId = existe.id;
      } else {
        const telefono = normalizarTelefono(datos.cliente.telefono);
        if (!telefono) throw new ErrorDeNegocio("Revisá el WhatsApp: con código de área, sin el 0 y sin el 15.");
        const existente = await tx.cliente.findUnique({ where: { veterinariaId_telefono: { veterinariaId, telefono } } });
        clienteId = (existente ?? (await tx.cliente.create({ data: { veterinariaId, nombre: datos.cliente.nombre, telefono } }))).id;
      }

      // Mascota: existente del cliente o nueva (si ya hay una con ese nombre, se usa esa)
      let mascota;
      if ("id" in datos.mascota) {
        mascota = await tx.mascota.findFirst({ where: { id: datos.mascota.id, clienteId, veterinariaId } });
        if (!mascota) throw new ErrorDeNegocio("Esa mascota no es de este cliente.");
      } else {
        const nombre = datos.mascota.nombre;
        const propias = await tx.mascota.findMany({ where: { clienteId } });
        mascota =
          propias.find((m) => normalizarNombre(m.nombre) === normalizarNombre(nombre)) ??
          (await tx.mascota.create({ data: { veterinariaId, clienteId, nombre, especie: datos.mascota.especie } }));
      }
      if (!especieCompatible(servicio.especie, mascota.especie)) {
        throw new ErrorDeNegocio(`${servicio.nombre} no es para la especie de ${mascota.nombre}.`);
      }

      const inicio = new Date(datos.inicio);
      const evaluacion = await evaluar(veterinariaId, servicio.id, inicio, undefined, tx);
      const advertencia = advertenciaDe(evaluacion, datos.profesionalId, datos.forzar);
      if (advertencia) return { advertencia };

      // Los turnos creados desde el panel nacen confirmados (sección 3)
      await tx.turno.create({
        data: {
          veterinariaId,
          inicio,
          fin: new Date(inicio.getTime() + servicio.duracionMin * 60_000),
          servicioId: servicio.id,
          profesionalId: datos.profesionalId,
          clienteId,
          mascotaId: mascota.id,
          estado: "CONFIRMADO",
          origen: datos.origen,
          precioAcordado: servicio.precio,
          notasInternas: datos.notasInternas || null,
          creadoPorId: usuario.id,
        },
      });
      return { ok: true as const, dia: diaLocal(inicio, (await veterinariaDe(veterinariaId, tx)).zonaHoraria) };
    }, { timeout: 15_000 });
    if ("ok" in resultado) refresh();
    return resultado;
  }),
);

// ─── Buscar clientes ────────────────────────────────────────────────────────

export const buscarClientes = accionProtegida(
  { roles: [...ROLES_AGENDA], esquema: z.object({ texto: z.string().trim().min(2).max(40) }) },
  async ({ texto }, usuario) => {
    const digitos = texto.replace(/\D/g, "");
    const clientes = await db.cliente.findMany({
      where: {
        veterinariaId: usuario.veterinariaId,
        OR: [
          { nombre: { contains: texto, mode: "insensitive" } },
          { mascotas: { some: { nombre: { contains: texto, mode: "insensitive" } } } },
          ...(digitos.length >= 3 ? [{ telefono: { contains: digitos } }] : []),
        ],
      },
      include: { mascotas: { select: { id: true, nombre: true, especie: true }, orderBy: { nombre: "asc" } } },
      orderBy: { nombre: "asc" },
      take: 8,
    });
    return clientes.map((c) => ({ id: c.id, nombre: c.nombre, telefono: c.telefono, mascotas: c.mascotas }));
  },
);
