"use client";

import { useEffect, useState, useTransition } from "react";
import { consultarHorario, horariosDelDia } from "@/server/turnos";
import type { EvaluacionProfesional } from "@/lib/disponibilidad";

export type HorarioElegido = { inicio: string; profesionalId: string };

/**
 * Elegir día, horario (de los libres o cualquier otro) y profesional.
 * En el panel se puede cargar fuera de horario o superpuesto: se muestra la advertencia.
 */
export function SelectorHorario({
  servicioId,
  diaInicial,
  excluirTurnoId,
  onCambio,
}: {
  servicioId: string;
  diaInicial: string;
  excluirTurnoId?: string;
  onCambio: (elegido: HorarioElegido | null) => void;
}) {
  const [dia, setDia] = useState(diaInicial);
  const [libres, setLibres] = useState<{ inicio: string; hora: string }[]>([]);
  const [hora, setHora] = useState<string | null>(null);
  const [otraHora, setOtraHora] = useState("");
  const [evaluacion, setEvaluacion] = useState<{ inicio: string; profesionales: EvaluacionProfesional[] } | null>(null);
  const [profesionalId, setProfesionalId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, iniciar] = useTransition();

  // Horarios libres del día inicial. Si cambia el servicio, el padre remonta el selector (key).
  useEffect(() => {
    if (!servicioId) return;
    iniciar(async () => {
      const r = await horariosDelDia({ servicioId, dia: diaInicial });
      setLibres(r.ok ? r.datos : []);
    });
  }, [servicioId, diaInicial]);

  function cambiarDia(nuevoDia: string) {
    setDia(nuevoDia);
    setHora(null);
    setEvaluacion(null);
    onCambio(null);
    if (!servicioId || !nuevoDia) return setLibres([]);
    iniciar(async () => {
      const r = await horariosDelDia({ servicioId, dia: nuevoDia });
      setLibres(r.ok ? r.datos : []);
    });
  }

  function elegirHora(h: string) {
    setHora(h);
    setError(null);
    iniciar(async () => {
      const r = await consultarHorario({ servicioId, dia, hora: h, excluirTurnoId });
      if (!r.ok) return setError(r.error);
      if ("error" in r.datos) return setError(r.datos.error);
      setEvaluacion(r.datos);
      const primero = r.datos.profesionales[0];
      setProfesionalId(primero?.id ?? null);
      onCambio(primero ? { inicio: r.datos.inicio, profesionalId: primero.id } : null);
    });
  }

  function elegirProfesional(id: string) {
    setProfesionalId(id);
    if (evaluacion) onCambio({ inicio: evaluacion.inicio, profesionalId: id });
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-800 sm:w-56">
        Día
        <input type="date" value={dia} onChange={(e) => cambiarDia(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-2" />
      </label>

      <div>
        <p className="text-sm font-medium text-zinc-800">Horarios libres {cargando && <span className="font-normal text-zinc-500">· cargando…</span>}</p>
        {!servicioId ? (
          <p className="mt-1 text-sm text-zinc-500">Elegí primero el servicio.</p>
        ) : libres.length === 0 && !cargando ? (
          <p className="mt-1 text-sm text-zinc-500">No hay horarios libres ese día. Podés cargar otro horario.</p>
        ) : (
          <div className="mt-2 flex flex-wrap gap-2">
            {libres.map((l) => (
              <button
                key={l.inicio}
                type="button"
                onClick={() => elegirHora(l.hora)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${hora === l.hora ? "border-emerald-800 bg-emerald-800 text-white" : "border-zinc-300 hover:bg-zinc-100"}`}
              >
                {l.hora}
              </button>
            ))}
          </div>
        )}
        {servicioId && (
          <div className="mt-3 flex items-end gap-2">
            <label className="flex flex-col gap-1 text-sm text-zinc-700">
              Otro horario
              <input type="time" value={otraHora} onChange={(e) => setOtraHora(e.target.value)} className="rounded-lg border border-zinc-300 px-3 py-1.5" />
            </label>
            <button type="button" disabled={!otraHora} onClick={() => elegirHora(otraHora)} className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm hover:bg-zinc-100 disabled:opacity-50">
              Usar
            </button>
          </div>
        )}
      </div>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {evaluacion && hora && (
        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm font-medium text-zinc-800">Profesional para las {hora}</legend>
          {evaluacion.profesionales.length === 0 && <p className="text-sm text-red-700">Ningún profesional atiende este servicio.</p>}
          {evaluacion.profesionales.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="radio" name="profesional" checked={profesionalId === p.id} onChange={() => elegirProfesional(p.id)} />
              <span className="text-zinc-900">{p.nombre}</span>
              {p.problema && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900">{p.problema}</span>}
            </label>
          ))}
        </fieldset>
      )}
    </div>
  );
}
