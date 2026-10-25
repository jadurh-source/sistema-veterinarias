"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { cambiarEstado } from "@/server/turnos";
import { NOMBRE_ACCION, type AccionTurno } from "@/lib/estados-turno";

const ESTILO: Record<AccionTurno, string> = {
  CONFIRMAR: "bg-emerald-800 text-white hover:bg-emerald-900",
  ATENDIDO: "bg-emerald-800 text-white hover:bg-emerald-900",
  AUSENTE: "border border-zinc-300 text-zinc-700 hover:bg-zinc-100",
  CANCELAR: "border border-zinc-300 text-zinc-700 hover:bg-zinc-100",
  REPROGRAMAR: "border border-zinc-300 text-zinc-700 hover:bg-zinc-100",
};

export function AccionesTurno({
  turnoId,
  acciones,
  enlaceWhatsapp,
}: {
  turnoId: string;
  acciones: AccionTurno[];
  enlaceWhatsapp: string | null;
}) {
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmandoCancelar, setConfirmandoCancelar] = useState(false);

  function ejecutar(accion: Exclude<AccionTurno, "REPROGRAMAR">) {
    setError(null);
    iniciar(async () => {
      const r = await cambiarEstado({ turnoId, accion });
      if (!r.ok) setError(r.error);
      else if ("error" in r.datos) setError(r.datos.error);
      setConfirmandoCancelar(false);
    });
  }

  if (confirmandoCancelar) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-zinc-700">¿Cancelar este turno? Libera el horario.</span>
        <button onClick={() => ejecutar("CANCELAR")} disabled={pendiente} className="rounded-lg bg-red-700 px-3 py-1.5 font-medium text-white hover:bg-red-800 disabled:opacity-60">
          Sí, cancelar
        </button>
        <button onClick={() => setConfirmandoCancelar(false)} className="rounded-lg px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">
          No
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2 text-sm">
        {acciones.map((accion) =>
          accion === "REPROGRAMAR" ? (
            <Link key={accion} href={`/panel/agenda/${turnoId}/reprogramar`} className={`rounded-lg px-3 py-1.5 font-medium ${ESTILO[accion]}`}>
              {NOMBRE_ACCION[accion]}
            </Link>
          ) : (
            <button
              key={accion}
              disabled={pendiente}
              onClick={() => (accion === "CANCELAR" ? setConfirmandoCancelar(true) : ejecutar(accion))}
              className={`rounded-lg px-3 py-1.5 font-medium disabled:opacity-60 ${ESTILO[accion]}`}
            >
              {NOMBRE_ACCION[accion]}
            </button>
          ),
        )}
        {enlaceWhatsapp && (
          <a href={enlaceWhatsapp} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-[#25d366] px-3 py-1.5 font-medium text-white hover:brightness-95">
            WhatsApp
          </a>
        )}
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
