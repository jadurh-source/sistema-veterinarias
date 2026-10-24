import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { datosLanding } from "@/lib/landing";
import { enlaceWhatsapp } from "@/lib/contacto";
import { Encabezado } from "@/components/publico/encabezado";
import { IconoWhatsapp } from "@/components/publico/iconos";
import { colorSeguro } from "@/components/publico/color";

// Provisoria: la reserva online en 4 pasos se arma en la Etapa 5.
// Mientras tanto deriva a WhatsApp con el servicio elegido ya escrito.

export const metadata: Metadata = { title: "Reservar turno" };

export default function Reservar(props: PageProps<"/[slug]/reservar">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: PageProps<"/[slug]/reservar">) {
  const { slug } = await params;
  const { servicio: servicioId } = await searchParams;
  const datos = await datosLanding(slug);
  if (!datos) notFound();

  const { veterinaria: vet } = datos;
  const servicio = datos.servicios.find((s) => s.id === servicioId);
  const mensaje = servicio
    ? `Hola ${vet.nombre}! Quería reservar un turno para: ${servicio.nombre}.`
    : `Hola ${vet.nombre}! Quería reservar un turno.`;

  return (
    <div style={{ "--marca": colorSeguro(vet.colorPrimario) } as React.CSSProperties} className="flex flex-1 flex-col">
      <Encabezado vet={vet} />
      <main className="flex flex-1 items-center justify-center bg-marca-suave px-4 py-16">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <h1 className="font-titulos text-4xl font-extrabold uppercase text-marca-oscuro">Reservá tu turno</h1>
          {servicio && <p className="mt-2 font-semibold text-zinc-800">{servicio.nombre}</p>}
          <p className="mt-3 text-zinc-600">
            Muy pronto vas a poder elegir el día y el horario desde acá. Por ahora, escribinos y te damos un turno.
          </p>
          <a
            href={enlaceWhatsapp(vet.whatsapp, mensaje)}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3.5 font-semibold text-white hover:brightness-95"
          >
            <IconoWhatsapp className="size-5" /> Pedir turno por WhatsApp
          </a>
          <Link href={`/${vet.slug}`} className="mt-4 inline-block text-sm text-zinc-600 hover:underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
