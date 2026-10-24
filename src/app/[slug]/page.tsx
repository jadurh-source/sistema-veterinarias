import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { datosLanding } from "@/lib/landing";
import { BarraReservaMovil, Encabezado } from "@/components/publico/encabezado";
import { Portada } from "@/components/publico/portada";
import { Mascotas } from "@/components/publico/mascotas";
import { Servicios } from "@/components/publico/servicios";
import { ComoReservar } from "@/components/publico/como-reservar";
import { Equipo } from "@/components/publico/equipo";
import { Contacto } from "@/components/publico/contacto";
import { Pie } from "@/components/publico/pie";
import { colorSeguro } from "@/components/publico/color";

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const datos = await datosLanding(slug);
  if (!datos) return { title: "Veterinaria no encontrada" };

  const { nombre, eslogan } = datos.veterinaria;
  const descripcion = eslogan ?? `Servicios, precios y turnos online en ${nombre}.`;
  return {
    title: `${nombre} · Turnos online`,
    description: descripcion,
    openGraph: {
      title: `${nombre} · Reservá tu turno online`,
      description: descripcion,
      images: [{ url: "/fotos/portada.jpg", width: 1600, height: 1067 }],
      locale: "es_AR",
      type: "website",
    },
  };
}

export default function PaginaVeterinaria({ params }: PageProps<"/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Landing params={params} />
    </Suspense>
  );
}

async function Landing({ params }: Pick<PageProps<"/[slug]">, "params">) {
  const { slug } = await params;
  const datos = await datosLanding(slug);
  if (!datos) notFound();

  const { veterinaria: vet } = datos;
  return (
    <div style={{ "--marca": colorSeguro(vet.colorPrimario) } as React.CSSProperties} className="flex flex-1 flex-col">
      <Encabezado vet={vet} />
      <main className="flex-1">
        <Portada vet={vet} />
        <Mascotas />
        <Servicios slug={vet.slug} servicios={datos.servicios} />
        <ComoReservar slug={vet.slug} />
        <Equipo profesionales={datos.profesionales} />
        <Contacto vet={vet} horarios={datos.horarios} />
      </main>
      <Pie vet={vet} />
      <BarraReservaMovil vet={vet} />
    </div>
  );
}
