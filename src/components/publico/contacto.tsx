import type { DatosLanding } from "@/lib/landing";
import { enlaceMapa, enlaceWhatsapp } from "@/lib/contacto";
import { resumirHorarios } from "@/lib/horarios";
import { IconoEmail, IconoReloj, IconoUbicacion, IconoWhatsapp } from "@/components/publico/iconos";

export function Contacto({ vet, horarios }: { vet: DatosLanding["veterinaria"]; horarios: DatosLanding["horarios"] }) {
  return (
    <section id="contacto" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-titulos text-4xl font-extrabold uppercase text-marca-oscuro sm:text-5xl">Horarios y contacto</h2>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-zinc-900">
              <IconoReloj className="size-5 text-marca" /> Horarios de atención
            </h3>
            <dl className="mt-4 divide-y divide-zinc-100">
              {resumirHorarios(horarios).map((h) => (
                <div key={h.dias} className="flex justify-between gap-4 py-2.5">
                  <dt className="text-zinc-700">{h.dias}</dt>
                  <dd className={h.horario === "Cerrado" ? "text-zinc-400" : "font-medium text-zinc-900"}>{h.horario}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl bg-marca-oscuro p-6 text-white">
            <h3 className="text-lg font-semibold">Encontranos</h3>
            {vet.direccion && (
              <a href={enlaceMapa(vet.direccion)} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 hover:underline">
                <IconoUbicacion className="mt-0.5 size-5 shrink-0" />
                <span>
                  {vet.direccion}
                  <span className="block text-sm text-white/70">Ver cómo llegar</span>
                </span>
              </a>
            )}
            <a href={enlaceWhatsapp(vet.whatsapp)} className="flex items-center gap-3 hover:underline">
              <IconoWhatsapp className="size-5 shrink-0" /> {vet.whatsapp}
            </a>
            {vet.email && (
              <a href={`mailto:${vet.email}`} className="flex items-center gap-3 hover:underline">
                <IconoEmail className="size-5 shrink-0" /> {vet.email}
              </a>
            )}
            <a
              href={enlaceWhatsapp(vet.whatsapp, `Hola ${vet.nombre}! Quería hacer una consulta.`)}
              className="mt-auto flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3 font-semibold text-white hover:brightness-95"
            >
              <IconoWhatsapp className="size-5" /> Escribinos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
