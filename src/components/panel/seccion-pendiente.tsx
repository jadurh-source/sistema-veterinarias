import { Suspense } from "react";
import type { Rol } from "@prisma/client";
import { exigirUsuario } from "@/lib/tenant";

// Página provisoria de una sección del panel que todavía no se construyó.
// Verifica sesión y rol igual que lo harán las pantallas reales.
export function SeccionPendiente({ titulo, etapa, roles = [] }: { titulo: string; etapa: number; roles?: Rol[] }) {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-zinc-900">{titulo}</h1>
      <Suspense fallback={<p className="mt-2 text-sm text-zinc-500">Cargando…</p>}>
        <Contenido etapa={etapa} roles={roles} />
      </Suspense>
    </section>
  );
}

async function Contenido({ etapa, roles }: { etapa: number; roles: Rol[] }) {
  await exigirUsuario(...roles);
  return <p className="mt-2 text-sm text-zinc-600">Esta sección se arma en la Etapa {etapa}.</p>;
}
