"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { reprogramarTurno } from "@/server/turnos";
import { SelectorHorario, type HorarioElegido } from "@/components/panel/agenda/selector-horario";

export function FormularioReprogramar({ turnoId, servicioId, diaActual }: { turnoId: string; servicioId: string; diaActual: string }) {
  const router = useRouter();
  const [horario, setHorario] = useState<HorarioElegido | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [advertencia, setAdvertencia] = useState<string | null>(null);
  const [enviando, iniciar] = useTransition();

  function enviar(forzar: boolean) {
    if (!horario) return;
    setError(null);
    iniciar(async () => {
      const r = await reprogramarTurno({ turnoId, inicio: horario.inicio, profesionalId: horario.profesionalId, forzar });
      if (!r.ok) return setError(r.error);
      if ("error" in r.datos) return setError(r.datos.error);
      if ("advertencia" in r.datos) return setAdvertencia(r.datos.advertencia ?? null);
      router.push(`/panel/agenda?dia=${r.datos.dia}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <SelectorHorario servicioId={servicioId} diaInicial={diaActual} excluirTurnoId={turnoId} onCambio={(h) => { setHorario(h); setAdvertencia(null); }} />
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {advertencia ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>{advertencia}</span>
          <button type="button" onClick={() => enviar(true)} disabled={enviando} className="rounded-lg bg-amber-700 px-3 py-1.5 font-medium text-white">
            Reprogramar igual
          </button>
        </div>
      ) : (
        <button type="button" disabled={!horario || enviando} onClick={() => enviar(false)} className="rounded-lg bg-emerald-800 px-4 py-3 font-medium text-white hover:bg-emerald-900 disabled:opacity-50">
          {enviando ? "Guardando…" : "Reprogramar"}
        </button>
      )}
    </div>
  );
}
