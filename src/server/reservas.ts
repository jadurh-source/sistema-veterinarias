"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { describirDia, diaLocal, horaLocal, sumarDias } from "@/lib/fechas";
import { especieCompatible, horariosLibresDelDia, type HorarioLibre } from "@/lib/disponibilidad";
import { cargarContexto, minimoWeb, veterinariaParaReservar } from "@/lib/reservas";
import { normalizarNombre, normalizarTelefono } from "@/lib/telefono";

// Reserva desde el sitio público. Es la única acción sin login: no lleva rol, pero valida
// todo con Zod y saca la veterinaria del slug, nunca de un id que mande el navegador.

const esquema = z.object({
  slug: z.string().min(1),
  servicioId: z.string().min(1),
  inicio: z.iso.datetime({ message: "Elegí un horario." }),
  especie: z.enum(["PERRO", "GATO", "OTRO"], { message: "Elegí la especie de tu mascota." }),
  nombre: z.string().trim().min(3, "Escribí tu nombre y apellido.").max(80),
  telefono: z.string().trim().min(6, "Escribí tu WhatsApp.").max(30),
  mascota: z.string().trim().min(1, "Escribí el nombre de tu mascota.").max(40),
  comentario: z.string().trim().max(300, "El comentario es muy largo (máximo 300 caracteres).").optional(),
  // Campo trampa: invisible para las personas, los robots lo completan
  sitioWeb: z.string().max(0).optional(),
});

export type EstadoReserva = {
  error?: string;
  /** Si el horario se ocupó: los siguientes libres para elegir otro. */
  alternativas?: { inicio: string; etiqueta: string }[];
  valores?: Partial<Record<"nombre" | "telefono" | "mascota" | "comentario", string>>;
};

const HORARIO_OCUPADO = "Ese horario se acaba de ocupar. Elegí otro.";

export async function reservarTurno(_anterior: EstadoReserva, formData: FormData): Promise<EstadoReserva> {
  const entrada = Object.fromEntries(formData.entries());
  const valores = {
    nombre: String(entrada.nombre ?? ""),
    telefono: String(entrada.telefono ?? ""),
    mascota: String(entrada.mascota ?? ""),
    comentario: String(entrada.comentario ?? ""),
  };

  const validacion = esquema.safeParse({ ...entrada, comentario: entrada.comentario || undefined });
  if (!validacion.success) {
    return { error: validacion.error.issues[0]?.message ?? "Revisá los datos.", valores };
  }
  const datos = validacion.data;
  if (datos.sitioWeb) return { error: "No pudimos tomar la reserva.", valores };

  const telefono = normalizarTelefono(datos.telefono);
  if (!telefono) {
    return { error: "Revisá el WhatsApp: escribilo con código de área, sin el 0 y sin el 15. Ej.: 381 555 1234", valores };
  }

  const vet = await veterinariaParaReservar(datos.slug);
  if (!vet) return { error: "No encontramos esta veterinaria.", valores };

  const servicio = await db.servicio.findFirst({
    where: { id: datos.servicioId, veterinariaId: vet.id, activo: true, visibleWeb: true },
  });
  if (!servicio) return { error: "Ese servicio ya no está disponible. Elegí otro.", valores };
  if (!especieCompatible(servicio.especie, datos.especie)) {
    return { error: "Ese servicio no es para la especie elegida.", valores };
  }

  const ahora = new Date();
  const inicio = new Date(datos.inicio);
  const dia = diaLocal(inicio, vet.zonaHoraria);
  const hoy = diaLocal(ahora, vet.zonaHoraria);
  if (dia > sumarDias(hoy, vet.diasReservaMax - 1)) {
    return { error: "Ese día todavía no está disponible para reservar.", valores };
  }

  const resultado = await db.$transaction(async (tx) => {
    // Una reserva por vez por veterinaria: evita que dos personas tomen el mismo horario
    await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${vet.id}))::text`;

    const ctx = await cargarContexto(tx, vet, dia, dia);
    const libre = horariosLibresDelDia(ctx, dia, servicio, minimoWeb(ahora)).find(
      (h) => h.inicio.getTime() === inicio.getTime(),
    );
    if (!libre) return { ocupado: true as const };

    const cliente =
      (await tx.cliente.findUnique({ where: { veterinariaId_telefono: { veterinariaId: vet.id, telefono } } })) ??
      (await tx.cliente.create({ data: { veterinariaId: vet.id, nombre: datos.nombre, telefono } }));

    const mascotas = await tx.mascota.findMany({ where: { clienteId: cliente.id } });
    const mascota =
      mascotas.find((m) => normalizarNombre(m.nombre) === normalizarNombre(datos.mascota)) ??
      (await tx.mascota.create({
        data: { veterinariaId: vet.id, clienteId: cliente.id, nombre: datos.mascota, especie: datos.especie },
      }));

    await tx.turno.create({
      data: {
        veterinariaId: vet.id,
        inicio: libre.inicio,
        fin: libre.fin,
        servicioId: servicio.id,
        profesionalId: libre.profesionalId,
        clienteId: cliente.id,
        mascotaId: mascota.id,
        estado: "PENDIENTE",
        origen: "WEB",
        precioAcordado: servicio.precio,
        comentarioCliente: datos.comentario ?? null,
      },
    });
    return { ocupado: false as const };
  });

  if (resultado.ocupado) {
    const alternativas = await siguientesLibres(vet, servicio, inicio, ahora);
    return { error: HORARIO_OCUPADO, alternativas, valores };
  }

  redirect(`/${vet.slug}/reservar/listo?servicio=${servicio.id}&inicio=${encodeURIComponent(inicio.toISOString())}`);
}

/** Hasta 4 horarios libres a partir del que se quiso reservar (ese día y los 2 siguientes). */
async function siguientesLibres(
  vet: { id: string; zonaHoraria: string },
  servicio: { categoria: Parameters<typeof horariosLibresDelDia>[2]["categoria"]; duracionMin: number },
  desde: Date,
  ahora: Date,
): Promise<{ inicio: string; etiqueta: string }[]> {
  const dia = diaLocal(desde, vet.zonaHoraria);
  const ctx = await cargarContexto(db, vet, dia, sumarDias(dia, 2));
  const libres: HorarioLibre[] = [];
  for (let i = 0; i < 3 && libres.length < 4; i++) {
    libres.push(...horariosLibresDelDia(ctx, sumarDias(dia, i), servicio, minimoWeb(ahora)).filter((h) => h.inicio > desde));
  }
  const hoy = diaLocal(ahora, vet.zonaHoraria);
  return libres.slice(0, 4).map((h) => ({
    inicio: h.inicio.toISOString(),
    etiqueta: `${describirDia(diaLocal(h.inicio, vet.zonaHoraria), hoy)} ${horaLocal(h.inicio, vet.zonaHoraria)}`,
  }));
}
