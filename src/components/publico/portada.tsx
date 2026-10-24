import Image from "next/image";
import Link from "next/link";
import type { DatosLanding } from "@/lib/landing";
import { enlaceWhatsapp } from "@/lib/contacto";
import { IconoHuella, IconoWhatsapp } from "@/components/publico/iconos";
import fotoPortada from "../../../public/fotos/portada.jpg";

export function Portada({ vet }: { vet: DatosLanding["veterinaria"] }) {
  return (
    <section className="relative overflow-hidden bg-marca-suave">
      {/* Huellas decorativas */}
      <IconoHuella className="absolute -left-6 top-10 size-28 -rotate-12 text-marca/10" />
      <IconoHuella className="absolute right-[45%] top-6 hidden size-16 rotate-12 text-marca/10 md:block" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-24 pt-10 md:grid-cols-2 md:pb-32 md:pt-16">
        <div>
          <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-marca-oscuro">
            <IconoHuella className="size-4" /> Turnos online
          </p>
          <h1 className="font-titulos text-5xl font-extrabold uppercase leading-[0.92] text-marca-oscuro sm:text-6xl lg:text-7xl">
            {vet.eslogan ?? `Bienvenidos a ${vet.nombre}`}
          </h1>
          <p className="mt-5 max-w-md text-lg text-zinc-700">
            Elegí el servicio, el día y el horario que te quede cómodo. Te confirmamos el turno por WhatsApp.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href={`/${vet.slug}/reservar`}
              className="rounded-full bg-marca px-7 py-3.5 font-semibold text-white shadow-md shadow-marca/20 hover:bg-marca-oscuro"
            >
              Reservá tu turno
            </Link>
            <a
              href={enlaceWhatsapp(vet.whatsapp, `Hola ${vet.nombre}! Quería hacer una consulta.`)}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3.5 font-semibold text-marca-oscuro shadow-sm hover:bg-marca-claro"
            >
              <IconoWhatsapp className="size-5 text-[#25d366]" /> Escribinos
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md md:max-w-none">
          <div className="absolute -right-4 -top-4 size-24 rounded-full bg-marca/20 md:size-32" />
          <div className="absolute -bottom-6 -left-4 size-16 rounded-full bg-white/60" />
          <Image
            src={fotoPortada}
            alt="Un perro feliz mirando a cámara"
            priority
            placeholder="blur"
            sizes="(min-width: 768px) 50vw, 100vw"
            className="relative aspect-[4/3] w-full rounded-[42%_58%_52%_48%/48%_44%_56%_52%] object-cover shadow-xl"
          />
        </div>
      </div>

      {/* Ola blanca de cierre, como en las publicaciones de la veterinaria */}
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute inset-x-0 bottom-0 h-16 w-full text-white md:h-24" aria-hidden="true">
        <path fill="currentColor" d="M0 64c180 48 360 64 560 40S940 8 1140 16s240 40 300 56v48H0Z" />
      </svg>
    </section>
  );
}
