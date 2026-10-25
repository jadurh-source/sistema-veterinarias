import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { exigirUsuario } from "@/lib/tenant";
import { describirDia, diaLocal, horaLocal } from "@/lib/fechas";
import { motivoNoPermitida } from "@/lib/estados-turno";
import { FormularioReprogramar } from "@/components/panel/agenda/formulario-reprogramar";

export default function Reprogramar(props: PageProps<"/panel/agenda/[id]/reprogramar">) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link href="/panel/agenda" className="text-sm text-zinc-600 hover:underline">← Volver a la agenda</Link>
      <h1 className="text-2xl font-semibold text-zinc-900">Reprogramar turno</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Cargando…</p>}>
        <Contenido {...props} />
      </Suspense>
    </div>
  );
}

async function Contenido({ params }: PageProps<"/panel/agenda/[id]/reprogramar">) {
  const usuario = await exigirUsuario("DUENO", "RECEPCION");
  const { id } = await params;
  const turno = await db.turno.findFirst({
    where: { id, veterinariaId: usuario.veterinariaId },
    include: {
      servicio: { select: { nombre: true } },
      profesional: { select: { nombre: true } },
      mascota: { select: { nombre: true } },
      cliente: { select: { nombre: true } },
      veterinaria: { select: { zonaHoraria: true } },
    },
  });
  if (!turno) notFound();

  const zona = turno.veterinaria.zonaHoraria;
  const ahora = new Date();
  const dia = diaLocal(turno.inicio, zona);
  const motivo = motivoNoPermitida(turno.estado, "REPROGRAMAR", turno.inicio, ahora);

  return (
    <>
      <div className="rounded-2xl bg-zinc-100 p-4 text-sm text-zinc-700">
        <p className="font-semibold text-zinc-900">
          {turno.mascota.nombre} · {turno.servicio.nombre}
        </p>
        <p>
          {turno.cliente.nombre} · ahora: <span className="first-letter:uppercase">{describirDia(dia, diaLocal(ahora, zona))}</span> a las{" "}
          {horaLocal(turno.inicio, zona)} con {turno.profesional.nombre}
        </p>
        <p className="mt-1 text-zinc-500">Se conserva el turno, su estado y su precio.</p>
      </div>
      {motivo ? (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{motivo}</p>
      ) : (
        <FormularioReprogramar turnoId={turno.id} servicioId={turno.servicioId} diaActual={dia} />
      )}
    </>
  );
}
