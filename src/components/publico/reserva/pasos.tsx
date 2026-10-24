import Link from "next/link";
import type { Especie } from "@prisma/client";
import type { DatosLanding } from "@/lib/landing";
import type { HorarioLibre } from "@/lib/disponibilidad";
import { especieCompatible } from "@/lib/disponibilidad";
import { describirDia, horaLocal, partesDelDia } from "@/lib/fechas";
import { formatearPesos } from "@/lib/dinero";
import { formatearDuracion } from "@/lib/horarios";
import { IconoCalendario, IconoCategoria, IconoReloj } from "@/components/publico/iconos";
import { NOMBRE_CATEGORIA, ORDEN_CATEGORIAS } from "@/components/publico/textos";

type Servicio = DatosLanding["servicios"][number];

export const ESPECIES: { valor: Especie; nombre: string; emoji: string }[] = [
  { valor: "PERRO", nombre: "Perro", emoji: "🐶" },
  { valor: "GATO", nombre: "Gato", emoji: "🐱" },
  { valor: "OTRO", nombre: "Otra mascota", emoji: "🐰" },
];

/** Arma la URL del flujo conservando lo ya elegido. */
export function enlacePaso(slug: string, datos: Partial<Record<"especie" | "servicio" | "dia" | "inicio", string>>): string {
  const params = new URLSearchParams();
  for (const [clave, valor] of Object.entries(datos)) if (valor) params.set(clave, valor);
  return `/${slug}/reservar?${params.toString()}`;
}

export function IndicadorPasos({ actual }: { actual: 1 | 2 | 3 }) {
  const pasos = ["Servicio", "Día y horario", "Tus datos"];
  return (
    <ol className="flex items-center gap-2 text-sm">
      {pasos.map((nombre, i) => {
        const n = i + 1;
        const hecho = n < actual;
        const activo = n === actual;
        return (
          <li key={nombre} className="flex flex-1 items-center gap-2">
            <span
              className={`grid size-7 shrink-0 place-items-center rounded-full font-semibold ${
                activo ? "bg-marca text-white" : hecho ? "bg-marca-suave text-marca-oscuro" : "bg-zinc-100 text-zinc-400"
              }`}
            >
              {n}
            </span>
            <span className={`hidden sm:inline ${activo ? "font-semibold text-zinc-900" : "text-zinc-500"}`}>{nombre}</span>
            {n < pasos.length && <span className="h-px flex-1 bg-zinc-200" />}
          </li>
        );
      })}
    </ol>
  );
}

export function ElegirServicio({
  slug,
  servicios,
  especie,
}: {
  slug: string;
  servicios: Servicio[];
  especie?: Especie;
}) {
  const compatibles = especie ? servicios.filter((s) => especieCompatible(s.especie, especie)) : [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">¿Para quién es el turno?</h2>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {ESPECIES.map((e) => (
            <Link
              key={e.valor}
              href={enlacePaso(slug, { especie: e.valor })}
              aria-current={especie === e.valor ? "true" : undefined}
              className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-4 text-center font-semibold ${
                especie === e.valor ? "border-marca bg-marca-claro text-marca-oscuro" : "border-zinc-200 text-zinc-700 hover:border-marca/50"
              }`}
            >
              <span className="text-3xl" aria-hidden="true">{e.emoji}</span>
              {e.nombre}
            </Link>
          ))}
        </div>
      </div>

      {especie && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Elegí el servicio</h2>
          {compatibles.length === 0 && <p className="mt-3 text-zinc-600">No hay servicios para reservar online para esta especie.</p>}
          <div className="mt-3 flex flex-col gap-6">
            {ORDEN_CATEGORIAS.map((categoria) => {
              const lista = compatibles.filter((s) => s.categoria === categoria);
              if (lista.length === 0) return null;
              return (
                <div key={categoria}>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-marca-oscuro">
                    <IconoCategoria categoria={categoria} className="size-4" /> {NOMBRE_CATEGORIA[categoria]}
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {lista.map((s) => (
                      <li key={s.id}>
                        <Link
                          href={enlacePaso(slug, { especie, servicio: s.id })}
                          className="flex items-center justify-between gap-3 rounded-2xl border border-zinc-200 px-4 py-3 hover:border-marca hover:bg-marca-claro"
                        >
                          <span>
                            <span className="block font-medium text-zinc-900">{s.nombre}</span>
                            <span className="flex items-center gap-1 text-sm text-zinc-500">
                              <IconoReloj className="size-3.5" /> {formatearDuracion(s.duracionMin)}
                            </span>
                          </span>
                          <span className="font-titulos text-xl font-extrabold text-marca-oscuro">{formatearPesos(s.precio)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export function ElegirHorario({
  slug,
  especie,
  servicioId,
  dias,
  diaElegido,
  hoy,
  zona,
}: {
  slug: string;
  especie: string;
  servicioId: string;
  dias: { dia: string; horarios: HorarioLibre[] }[];
  diaElegido: string;
  hoy: string;
  zona: string;
}) {
  const delDia = dias.find((d) => d.dia === diaElegido) ?? dias[0];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
          <IconoCalendario className="size-5 text-marca" /> Elegí el día
        </h2>
        <ul className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-2">
          {dias.map(({ dia }) => {
            const p = partesDelDia(dia);
            const activo = dia === delDia.dia;
            return (
              <li key={dia}>
                <Link
                  href={enlacePaso(slug, { especie, servicio: servicioId, dia })}
                  scroll={false}
                  aria-current={activo ? "date" : undefined}
                  className={`flex w-16 flex-col items-center rounded-2xl border-2 py-2 ${
                    activo ? "border-marca bg-marca text-white" : "border-zinc-200 text-zinc-700 hover:border-marca/50"
                  }`}
                >
                  <span className="text-xs uppercase">{dia === hoy ? "hoy" : p.semana}</span>
                  <span className="font-titulos text-2xl font-extrabold leading-tight">{p.numero}</span>
                  <span className="text-xs">{p.mes}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900">
          Horarios libres <span className="font-normal text-zinc-500">· {describirDia(delDia.dia, hoy)}</span>
        </h2>
        <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-5">
          {delDia.horarios.map((h) => (
            <li key={h.inicio.toISOString()}>
              <Link
                href={enlacePaso(slug, { especie, servicio: servicioId, dia: delDia.dia, inicio: h.inicio.toISOString() })}
                className="block rounded-xl border-2 border-zinc-200 py-2.5 text-center font-semibold text-zinc-800 hover:border-marca hover:bg-marca-claro"
              >
                {horaLocal(h.inicio, zona)}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Resumen de lo elegido, arriba de los pasos 2 y 3. */
export function ResumenReserva({
  servicio,
  cuando,
  cambiar,
}: {
  servicio: Servicio;
  cuando?: string;
  cambiar: { servicio: string; horario?: string };
}) {
  return (
    <div className="rounded-2xl bg-marca-claro p-4 text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-zinc-900">{servicio.nombre}</p>
          <p className="text-zinc-600">
            {formatearDuracion(servicio.duracionMin)} · {formatearPesos(servicio.precio)}
          </p>
        </div>
        <Link href={cambiar.servicio} className="text-marca underline">Cambiar</Link>
      </div>
      {cuando && cambiar.horario && (
        <div className="mt-3 flex items-start justify-between gap-3 border-t border-marca/10 pt-3">
          <p className="font-semibold text-zinc-900 first-letter:uppercase">{cuando}</p>
          <Link href={cambiar.horario} className="text-marca underline">Cambiar</Link>
        </div>
      )}
    </div>
  );
}
