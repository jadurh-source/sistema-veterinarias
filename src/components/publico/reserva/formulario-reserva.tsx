"use client";

import { useActionState } from "react";
import Link from "next/link";
import { reservarTurno, type EstadoReserva } from "@/server/reservas";

type Props = {
  slug: string;
  servicioId: string;
  especie: string;
  inicio: string;
  /** Enlace al paso 2 con los mismos datos, para armar los enlaces de horarios alternativos. */
  enlaceHorarios: string;
};

const claseCampo =
  "rounded-xl border border-zinc-300 px-3 py-3 text-base outline-none focus:border-marca focus:ring-2 focus:ring-marca/20";

export function FormularioReserva({ slug, servicioId, especie, inicio, enlaceHorarios }: Props) {
  const [estado, enviar, enviando] = useActionState<EstadoReserva, FormData>(reservarTurno, {});
  const v = estado.valores ?? {};

  return (
    <form action={enviar} className="flex flex-col gap-4">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="servicioId" value={servicioId} />
      <input type="hidden" name="especie" value={especie} />
      <input type="hidden" name="inicio" value={inicio} />
      {/* Campo trampa para robots: oculto a las personas */}
      <input type="text" name="sitioWeb" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
        Tu nombre y apellido
        <input name="nombre" required autoComplete="name" defaultValue={v.nombre} className={claseCampo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
        Tu WhatsApp
        <input
          name="telefono"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="381 555 1234"
          defaultValue={v.telefono}
          className={claseCampo}
        />
        <span className="text-xs font-normal text-zinc-500">Con código de área, sin el 0 y sin el 15.</span>
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
        Nombre de tu mascota
        <input name="mascota" required defaultValue={v.mascota} className={claseCampo} />
      </label>
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800">
        Comentario <span className="font-normal text-zinc-500">(opcional)</span>
        <textarea
          name="comentario"
          rows={3}
          maxLength={300}
          placeholder="Ej.: es su primera visita, está un poco nervioso…"
          defaultValue={v.comentario}
          className={claseCampo}
        />
      </label>

      {estado.error && (
        <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">{estado.error}</p>
          {estado.alternativas && estado.alternativas.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {estado.alternativas.map((a) => (
                <Link
                  key={a.inicio}
                  href={`${enlaceHorarios}&inicio=${encodeURIComponent(a.inicio)}`}
                  className="rounded-full border border-red-200 bg-white px-3 py-1 text-red-900 hover:bg-red-100"
                >
                  {a.etiqueta}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="rounded-full bg-marca px-6 py-3.5 font-semibold text-white hover:bg-marca-oscuro disabled:opacity-60"
      >
        {enviando ? "Reservando…" : "Confirmar reserva"}
      </button>
      <p className="text-center text-xs text-zinc-500">
        Usamos tus datos solo para confirmarte el turno.{" "}
        <Link href={`/${slug}`} className="underline">Volver al inicio</Link>
      </p>
    </form>
  );
}
