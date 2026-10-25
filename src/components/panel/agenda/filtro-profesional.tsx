"use client";

import { useRouter } from "next/navigation";

/** Selector de profesional: cambia la URL conservando el resto de los filtros. */
export function FiltroProfesional({
  profesionales,
  elegido,
  base,
}: {
  profesionales: { id: string; nombre: string }[];
  elegido?: string;
  /** URL de la agenda sin el parámetro profesional, con "?" o "&" al final. */
  base: string;
}) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-sm text-zinc-700">
      <span className="sr-only sm:not-sr-only">Profesional</span>
      <select
        value={elegido ?? ""}
        onChange={(e) => router.push(e.target.value ? `${base}profesional=${e.target.value}` : base.slice(0, -1))}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2"
      >
        <option value="">Todos</option>
        {profesionales.map((p) => (
          <option key={p.id} value={p.id}>
            {p.nombre}
          </option>
        ))}
      </select>
    </label>
  );
}
