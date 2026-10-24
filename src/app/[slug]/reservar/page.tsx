import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import type { Especie } from "@prisma/client";
import { datosLanding } from "@/lib/landing";
import { enlaceWhatsapp } from "@/lib/contacto";
import { especieCompatible } from "@/lib/disponibilidad";
import { describirDia, diaLocal, horaLocal } from "@/lib/fechas";
import { disponibilidadWeb, veterinariaParaReservar } from "@/lib/reservas";
import { Encabezado } from "@/components/publico/encabezado";
import { IconoWhatsapp } from "@/components/publico/iconos";
import { colorSeguro } from "@/components/publico/color";
import {
  ESPECIES,
  ElegirHorario,
  ElegirServicio,
  IndicadorPasos,
  ResumenReserva,
  enlacePaso,
} from "@/components/publico/reserva/pasos";
import { FormularioReserva } from "@/components/publico/reserva/formulario-reserva";

// Reserva online en pasos (docs/02-modulos.md, A2). Cada paso es la misma página con lo
// elegido en la URL: especie → servicio → día → horario → datos.

export const metadata: Metadata = { title: "Reservar turno" };

export default function Reservar(props: PageProps<"/[slug]/reservar">) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50" />}>
      <Contenido {...props} />
    </Suspense>
  );
}

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);

async function Contenido({ params, searchParams }: PageProps<"/[slug]/reservar">) {
  const { slug } = await params;
  const sp = await searchParams;
  const [datos, vetReserva] = await Promise.all([datosLanding(slug), veterinariaParaReservar(slug)]);
  if (!datos || !vetReserva) notFound();
  await connection(); // la disponibilidad depende de la hora actual

  const { veterinaria: vet } = datos;
  let servicio = datos.servicios.find((s) => s.id === texto(sp.servicio));
  let especie = ESPECIES.find((e) => e.valor === texto(sp.especie))?.valor as Especie | undefined;
  // Si vino desde la landing con un servicio solo para perros o gatos, la especie es obvia
  if (servicio && !especie && servicio.especie !== "TODAS") especie = servicio.especie;
  if (servicio && especie && !especieCompatible(servicio.especie, especie)) servicio = undefined;

  const ahora = new Date();
  const hoy = diaLocal(ahora, vetReserva.zonaHoraria);
  const inicioElegido = texto(sp.inicio);

  let cuerpo: React.ReactNode;
  let paso: 1 | 2 | 3 = 1;

  if (!servicio || !especie) {
    cuerpo = <ElegirServicio slug={slug} servicios={datos.servicios} especie={especie} />;
  } else {
    const dias = await disponibilidadWeb(vetReserva, servicio, ahora);
    const enlaceServicio = enlacePaso(slug, { especie });
    const enlaceHorarios = enlacePaso(slug, { especie, servicio: servicio.id, dia: texto(sp.dia) });
    const elegido = dias.flatMap((d) => d.horarios).find((h) => h.inicio.toISOString() === inicioElegido);

    if (dias.length === 0) {
      paso = 2;
      cuerpo = (
        <SinLugar whatsapp={vet.whatsapp} nombre={vet.nombre} servicio={servicio.nombre}>
          <ResumenReserva servicio={servicio} cambiar={{ servicio: enlaceServicio }} />
        </SinLugar>
      );
    } else if (!elegido) {
      paso = 2;
      cuerpo = (
        <div className="flex flex-col gap-6">
          <ResumenReserva servicio={servicio} cambiar={{ servicio: enlaceServicio }} />
          {inicioElegido && (
            <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Ese horario ya no está disponible. Elegí otro.
            </p>
          )}
          <ElegirHorario
            slug={slug}
            especie={especie}
            servicioId={servicio.id}
            dias={dias}
            diaElegido={texto(sp.dia) ?? dias[0].dia}
            hoy={hoy}
            zona={vetReserva.zonaHoraria}
          />
        </div>
      );
    } else {
      paso = 3;
      const cuando = `${describirDia(diaLocal(elegido.inicio, vetReserva.zonaHoraria), hoy)} a las ${horaLocal(elegido.inicio, vetReserva.zonaHoraria)}`;
      cuerpo = (
        <div className="flex flex-col gap-6">
          <ResumenReserva servicio={servicio} cuando={cuando} cambiar={{ servicio: enlaceServicio, horario: enlaceHorarios }} />
          <h2 className="text-lg font-semibold text-zinc-900">Completá tus datos</h2>
          <FormularioReserva
            slug={slug}
            servicioId={servicio.id}
            especie={especie}
            inicio={elegido.inicio.toISOString()}
            enlaceHorarios={enlacePaso(slug, { especie, servicio: servicio.id })}
          />
        </div>
      );
    }
  }

  return (
    <div style={{ "--marca": colorSeguro(vet.colorPrimario) } as React.CSSProperties} className="flex flex-1 flex-col">
      <Encabezado vet={vet} />
      <main className="flex-1 bg-marca-claro px-4 py-8">
        <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4">
            <h1 className="font-titulos text-4xl font-extrabold uppercase text-marca-oscuro">Reservá tu turno</h1>
            <IndicadorPasos actual={paso} />
          </div>
          {cuerpo}
        </div>
        <p className="mt-6 text-center text-sm text-zinc-600">
          ¿Preferís hablar con nosotros?{" "}
          <a href={enlaceWhatsapp(vet.whatsapp)} className="font-medium text-marca underline">Escribinos por WhatsApp</a>
        </p>
      </main>
    </div>
  );
}

function SinLugar({ whatsapp, nombre, servicio, children }: { whatsapp: string; nombre: string; servicio: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      {children}
      <p className="text-zinc-700">No quedan horarios libres online para este servicio en los próximos días. Escribinos y te buscamos un lugar.</p>
      <a
        href={enlaceWhatsapp(whatsapp, `Hola ${nombre}! Quería un turno para: ${servicio}.`)}
        className="flex items-center justify-center gap-2 rounded-full bg-[#25d366] px-6 py-3.5 font-semibold text-white"
      >
        <IconoWhatsapp className="size-5" /> Pedir turno por WhatsApp
      </a>
    </div>
  );
}
