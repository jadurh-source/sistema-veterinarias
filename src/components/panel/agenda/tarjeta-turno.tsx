import type { EstadoTurno, Especie } from "@prisma/client";
import type { TurnoAgenda } from "@/lib/agenda";
import { horaLocal } from "@/lib/fechas";
import { formatearPesos } from "@/lib/dinero";
import { enlaceWhatsapp } from "@/lib/contacto";
import { mensajeConfirmacion } from "@/lib/mensajes";
import { accionesDisponibles, NOMBRE_ESTADO, NOMBRE_ORIGEN } from "@/lib/estados-turno";
import { AccionesTurno } from "@/components/panel/agenda/acciones-turno";

export const COLOR_ESTADO: Record<EstadoTurno, string> = {
  PENDIENTE: "bg-amber-100 text-amber-900",
  CONFIRMADO: "bg-sky-100 text-sky-900",
  ATENDIDO: "bg-emerald-100 text-emerald-900",
  AUSENTE: "bg-red-100 text-red-900",
  CANCELADO: "bg-zinc-100 text-zinc-500",
};

export const EMOJI_ESPECIE: Record<Especie, string> = { PERRO: "🐶", GATO: "🐱", OTRO: "🐰" };

export function TarjetaTurno({
  turno,
  zona,
  veterinaria,
  ahora,
}: {
  turno: TurnoAgenda;
  zona: string;
  veterinaria: string;
  ahora: Date;
}) {
  const acciones = accionesDisponibles(turno.estado, turno.inicio, ahora);
  const conWhatsapp = turno.estado === "PENDIENTE" || turno.estado === "CONFIRMADO";
  const whatsapp = conWhatsapp
    ? enlaceWhatsapp(
        turno.cliente.telefono,
        mensajeConfirmacion({
          cliente: turno.cliente.nombre,
          mascota: turno.mascota.nombre,
          servicio: turno.servicio.nombre,
          inicio: turno.inicio,
          veterinaria,
          zona,
        }),
      )
    : null;
  const cancelado = turno.estado === "CANCELADO";

  return (
    <li className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:flex-row sm:items-start ${cancelado ? "border-zinc-100 opacity-60" : "border-zinc-200"}`}>
      <div className="w-24 shrink-0">
        <p className={`text-lg font-semibold text-zinc-900 ${cancelado ? "line-through" : ""}`}>{horaLocal(turno.inicio, zona)}</p>
        <p className="text-xs text-zinc-500">a {horaLocal(turno.fin, zona)}</p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-zinc-900">
            <span aria-hidden="true">{EMOJI_ESPECIE[turno.mascota.especie]}</span> {turno.mascota.nombre}
            <span className="font-normal text-zinc-600"> · {turno.servicio.nombre}</span>
          </p>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLOR_ESTADO[turno.estado]}`}>{NOMBRE_ESTADO[turno.estado]}</span>
          <span className="rounded-full border border-zinc-200 px-2 py-0.5 text-xs text-zinc-600">{NOMBRE_ORIGEN[turno.origen]}</span>
        </div>
        <p className="text-sm text-zinc-600">
          {turno.cliente.nombre} · {turno.cliente.telefono} · <span className="text-zinc-800">{turno.profesional.nombre}</span> ·{" "}
          {formatearPesos(turno.precioAcordado)}
          {turno.cobrado > 0 && <span className="text-emerald-700"> (cobrado {formatearPesos(turno.cobrado)})</span>}
        </p>
        {turno.comentarioCliente && <p className="rounded-lg bg-amber-50 px-3 py-1.5 text-sm text-amber-900">“{turno.comentarioCliente}”</p>}
        {turno.notasInternas && <p className="text-sm text-zinc-500">Nota: {turno.notasInternas}</p>}
        {(acciones.length > 0 || whatsapp) && <AccionesTurno turnoId={turno.id} acciones={acciones} enlaceWhatsapp={whatsapp} />}
      </div>
    </li>
  );
}
