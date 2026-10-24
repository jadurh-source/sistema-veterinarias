import Image from "next/image";
import type { DatosLanding } from "@/lib/landing";
import { NOMBRE_CATEGORIA, NOMBRE_TIPO } from "@/components/publico/textos";
import fotoCuidado from "../../../public/fotos/cuidado.jpg";

/** "Dra. Ana Morales" → "AM" (ignora el título). */
function iniciales(nombre: string): string {
  return nombre
    .replace(/^(dra?|lic)\.\s*/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

export function Equipo({ profesionales }: { profesionales: DatosLanding["profesionales"] }) {
  if (profesionales.length === 0) return null;

  return (
    <section id="equipo" className="scroll-mt-20 bg-marca-suave py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-10 md:grid-cols-[2fr_3fr]">
          <div>
            <h2 className="font-titulos text-4xl font-extrabold uppercase text-marca-oscuro sm:text-5xl">Nuestro equipo</h2>
            <p className="mt-3 text-lg text-zinc-700">
              Personas que aman a los animales y los cuidan como si fueran propios.
            </p>
            <Image
              src={fotoCuidado}
              alt="Una persona acariciando a su gato"
              placeholder="blur"
              sizes="(min-width: 768px) 40vw, 100vw"
              className="mt-6 hidden aspect-[4/3] w-full rounded-[2.5rem] object-cover md:block"
            />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {profesionales.map((p) => (
              <li key={p.id} className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-marca font-titulos text-2xl font-extrabold text-white">
                  {iniciales(p.nombre)}
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900">{p.nombre}</h3>
                  <p className="text-sm text-zinc-600">{NOMBRE_TIPO[p.tipo]}</p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {p.categorias.map((c) => (
                      <li key={c} className="rounded-full bg-marca-claro px-2 py-0.5 text-xs font-medium text-marca-oscuro">
                        {NOMBRE_CATEGORIA[c]}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
