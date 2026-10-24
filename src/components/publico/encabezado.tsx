import Link from "next/link";
import type { DatosLanding } from "@/lib/landing";
import { enlaceWhatsapp } from "@/lib/contacto";
import { IconoHuella, IconoUbicacion, IconoWhatsapp } from "@/components/publico/iconos";

type Vet = DatosLanding["veterinaria"];

export function Logo({ vet }: { vet: Vet }) {
  return (
    <span className="flex items-center gap-2.5">
      {vet.logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- el logo viene de un almacenamiento externo
        <img src={vet.logoUrl} alt="" className="size-10 rounded-full object-cover" />
      ) : (
        <span className="grid size-10 place-items-center rounded-full bg-marca text-white">
          <IconoHuella className="size-6" />
        </span>
      )}
      <span className="font-titulos text-2xl font-extrabold uppercase leading-none tracking-wide text-marca-oscuro">
        {vet.nombre}
      </span>
    </span>
  );
}

export function Encabezado({ vet }: { vet: Vet }) {
  return (
    <>
      <div className="hidden bg-marca-oscuro text-sm text-white md:block">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-2">
          <a href={enlaceWhatsapp(vet.whatsapp)} className="flex items-center gap-1.5 hover:underline">
            <IconoWhatsapp className="size-4" /> {vet.whatsapp}
          </a>
          {vet.direccion && (
            <span className="flex items-center gap-1.5">
              <IconoUbicacion className="size-4" /> {vet.direccion}
            </span>
          )}
        </div>
      </div>
      <header className="sticky top-0 z-30 border-b border-zinc-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href={`/${vet.slug}`} aria-label={`${vet.nombre}, inicio`}>
            <Logo vet={vet} />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-700 md:flex">
            <a href="#servicios" className="hover:text-marca">Servicios</a>
            <a href="#como-reservar" className="hover:text-marca">Cómo reservar</a>
            <a href="#equipo" className="hover:text-marca">Equipo</a>
            <a href="#contacto" className="hover:text-marca">Horarios y contacto</a>
          </nav>
          <Link
            href={`/${vet.slug}/reservar`}
            className="hidden rounded-full bg-marca px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-marca-oscuro sm:inline-block"
          >
            Reservar turno
          </Link>
        </div>
      </header>
    </>
  );
}

/** En el celular, el botón de reservar queda siempre a mano abajo. */
export function BarraReservaMovil({ vet }: { vet: Vet }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-zinc-200 bg-white/95 p-3 backdrop-blur sm:hidden">
      <Link href={`/${vet.slug}/reservar`} className="flex-1 rounded-full bg-marca py-3 text-center font-semibold text-white">
        Reservar turno
      </Link>
      <a
        href={enlaceWhatsapp(vet.whatsapp)}
        aria-label="Escribinos por WhatsApp"
        className="grid size-12 place-items-center rounded-full bg-[#25d366] text-white"
      >
        <IconoWhatsapp className="size-6" />
      </a>
    </div>
  );
}
