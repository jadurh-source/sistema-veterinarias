import type { DatosLanding } from "@/lib/landing";
import { enlaceWhatsapp } from "@/lib/contacto";
import { IconoHuella } from "@/components/publico/iconos";

export function Pie({ vet }: { vet: DatosLanding["veterinaria"] }) {
  return (
    // pb extra en el celular para que la barra fija de reservar no tape el pie
    <footer className="bg-marca-oscuro pb-24 text-white/90 sm:pb-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 font-titulos text-2xl font-extrabold uppercase text-white">
            <IconoHuella className="size-6" /> {vet.nombre}
          </p>
          {vet.eslogan && <p className="mt-1 max-w-sm text-sm text-white/70">{vet.eslogan}</p>}
        </div>
        <div className="flex flex-col gap-1 text-sm">
          {vet.direccion && <span>{vet.direccion}</span>}
          <a href={enlaceWhatsapp(vet.whatsapp)} className="hover:underline">WhatsApp {vet.whatsapp}</a>
          {vet.email && <a href={`mailto:${vet.email}`} className="hover:underline">{vet.email}</a>}
        </div>
      </div>
    </footer>
  );
}
