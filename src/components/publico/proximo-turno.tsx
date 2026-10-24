import { connection } from "next/server";
import { describirDia, diaLocal, horaLocal } from "@/lib/fechas";
import { proximoTurnoDisponible } from "@/lib/reservas";
import { IconoCalendario } from "@/components/publico/iconos";

/** "Próximo turno disponible: hoy 17:30". Se calcula en cada visita (no se cachea). */
export async function ProximoTurno({ slug, zona }: { slug: string; zona: string }) {
  await connection();
  const ahora = new Date();
  const libre = await proximoTurnoDisponible(slug, ahora);
  if (!libre) return null;

  const dia = describirDia(diaLocal(libre.inicio, zona), diaLocal(ahora, zona));
  return (
    <p className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white/80 px-4 py-2.5 text-sm text-zinc-700 shadow-sm">
      <IconoCalendario className="size-5 text-marca" />
      <span>
        Próximo turno disponible: <strong className="text-marca-oscuro">{dia} {horaLocal(libre.inicio, zona)}</strong>
      </span>
    </p>
  );
}
