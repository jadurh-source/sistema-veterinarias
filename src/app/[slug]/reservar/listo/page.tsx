import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { datosLanding } from "@/lib/landing";
import { describirDia, diaLocal, horaLocal } from "@/lib/fechas";
import { enlaceWhatsapp } from "@/lib/contacto";
import { Encabezado } from "@/components/publico/encabezado";
import { IconoCheck, IconoWhatsapp } from "@/components/publico/iconos";
import { colorSeguro } from "@/components/publico/color";

export const metadata: Metadata = { title: "Recibimos tu solicitud" };

export default function ReservaLista(props: PageProps<"/[slug]/reservar/listo">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Contenido {...props} />
    </Suspense>
  );
}

async function Contenido({ params, searchParams }: PageProps<"/[slug]/reservar/listo">) {
  const { slug } = await params;
  const sp = await searchParams;
  const datos = await datosLanding(slug);
  if (!datos) notFound();
  await connection(); // "hoy" o "mañana" depende de la fecha actual

  const { veterinaria: vet } = datos;
  const servicio = datos.servicios.find((s) => s.id === sp.servicio);
  const inicio = typeof sp.inicio === "string" ? new Date(sp.inicio) : null;
  const zona = vet.zonaHoraria;
  const cuando =
    inicio && !Number.isNaN(inicio.getTime())
      ? `${describirDia(diaLocal(inicio, zona), diaLocal(new Date(), zona))} a las ${horaLocal(inicio, zona)}`
      : null;

  return (
    <div style={{ "--marca": colorSeguro(vet.colorPrimario) } as React.CSSProperties} className="flex flex-1 flex-col">
      <Encabezado vet={vet} />
      <main className="flex flex-1 items-start justify-center bg-marca-claro px-4 py-12">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-marca text-white">
            <IconoCheck className="size-9" />
          </span>
          <h1 className="mt-4 font-titulos text-4xl font-extrabold uppercase text-marca-oscuro">¡Recibimos tu solicitud!</h1>
          {servicio && cuando && (
            <p className="mt-3 text-zinc-800">
              <span className="font-semibold">{servicio.nombre}</span>
              <br />
              <span className="first-letter:uppercase">{cuando}</span>
            </p>
          )}
          <p className="mt-4 text-zinc-600">Te confirmamos el turno por WhatsApp. Si necesitás cambiar algo, escribinos.</p>
          <a
            href={enlaceWhatsapp(vet.whatsapp)}
            className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3 font-semibold text-white"
          >
            <IconoWhatsapp className="size-5" /> Escribinos
          </a>
          <Link href={`/${vet.slug}`} className="mt-4 inline-block text-sm text-zinc-600 underline">
            Volver al inicio
          </Link>
        </div>
      </main>
    </div>
  );
}
