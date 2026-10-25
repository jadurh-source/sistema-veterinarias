import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { exigirUsuario } from "@/lib/tenant";
import { diaLocal } from "@/lib/fechas";
import { formatearPesos } from "@/lib/dinero";
import { formatearDuracion } from "@/lib/horarios";
import { FormularioNuevoTurno } from "@/components/panel/agenda/formulario-nuevo-turno";

export default function NuevoTurno() {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <Link href="/panel/agenda" className="text-sm text-zinc-600 hover:underline">← Volver a la agenda</Link>
      <h1 className="text-2xl font-semibold text-zinc-900">Nuevo turno</h1>
      <Suspense fallback={<p className="text-sm text-zinc-500">Cargando…</p>}>
        <Contenido />
      </Suspense>
    </div>
  );
}

async function Contenido() {
  const usuario = await exigirUsuario("DUENO", "RECEPCION");
  const [vet, servicios] = await Promise.all([
    db.veterinaria.findUniqueOrThrow({ where: { id: usuario.veterinariaId }, select: { zonaHoraria: true } }),
    // Desde el panel se puede dar turno también para servicios ocultos en la web
    db.servicio.findMany({ where: { veterinariaId: usuario.veterinariaId, activo: true }, orderBy: [{ orden: "asc" }, { nombre: "asc" }] }),
  ]);

  return (
    <FormularioNuevoTurno
      hoy={diaLocal(new Date(), vet.zonaHoraria)}
      servicios={servicios.map((s) => ({
        id: s.id,
        nombre: s.nombre,
        especie: s.especie,
        duracion: formatearDuracion(s.duracionMin),
        precio: formatearPesos(s.precio),
      }))}
    />
  );
}
