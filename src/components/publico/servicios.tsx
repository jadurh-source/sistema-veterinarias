import Link from "next/link";
import type { DatosLanding } from "@/lib/landing";
import { formatearPesos } from "@/lib/dinero";
import { formatearDuracion } from "@/lib/horarios";
import { IconoCategoria, IconoReloj } from "@/components/publico/iconos";
import { NOMBRE_CATEGORIA, ORDEN_CATEGORIAS, TEXTO_ESPECIE } from "@/components/publico/textos";

export function Servicios({ slug, servicios }: { slug: string; servicios: DatosLanding["servicios"] }) {
  const categorias = ORDEN_CATEGORIAS.map((categoria) => ({
    categoria,
    servicios: servicios.filter((s) => s.categoria === categoria),
  })).filter((c) => c.servicios.length > 0);

  return (
    <section id="servicios" className="scroll-mt-20 bg-marca-claro py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-titulos text-4xl font-extrabold uppercase text-marca-oscuro sm:text-5xl">Servicios y precios</h2>
        <p className="mx-auto mt-2 max-w-xl text-center text-zinc-600">Precios finales. Reservá online el que necesites.</p>

        {categorias.length === 0 && <p className="mt-10 text-center text-zinc-600">Pronto vas a ver acá nuestros servicios.</p>}

        <div className="mt-10 flex flex-col gap-12">
          {categorias.map(({ categoria, servicios }) => (
            <div key={categoria}>
              <h3 className="flex items-center gap-3 font-titulos text-2xl font-extrabold uppercase text-marca-oscuro">
                <span className="grid size-11 place-items-center rounded-2xl bg-marca text-white">
                  <IconoCategoria categoria={categoria} className="size-6" />
                </span>
                {NOMBRE_CATEGORIA[categoria]}
              </h3>
              <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {servicios.map((s) => (
                  <li key={s.id} className="flex flex-col rounded-3xl border border-zinc-100 bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="text-lg font-semibold leading-snug text-zinc-900">{s.nombre}</h4>
                      <span className="whitespace-nowrap font-titulos text-2xl font-extrabold text-marca-oscuro">
                        {formatearPesos(s.precio)}
                      </span>
                    </div>
                    {s.descripcion && <p className="mt-1 text-sm text-zinc-600">{s.descripcion}</p>}
                    <div className="mt-auto flex items-center justify-between gap-3 pt-4">
                      <span className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
                        <span className="flex items-center gap-1">
                          <IconoReloj className="size-4" /> {formatearDuracion(s.duracionMin)}
                        </span>
                        {TEXTO_ESPECIE[s.especie] && (
                          <span className="rounded-full bg-marca-suave px-2 py-0.5 text-xs font-medium text-marca-oscuro">
                            {TEXTO_ESPECIE[s.especie]}
                          </span>
                        )}
                      </span>
                      <Link
                        href={`/${slug}/reservar?servicio=${s.id}`}
                        className="rounded-full border-2 border-marca px-4 py-1.5 text-sm font-semibold text-marca hover:bg-marca hover:text-white"
                      >
                        Reservar
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
