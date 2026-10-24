import { Suspense } from "react";
import { SeccionPendiente } from "@/components/panel/seccion-pendiente";

export default function Agenda({ searchParams }: PageProps<"/panel/agenda">) {
  return (
    <>
      <Suspense>
        <AvisoSinPermiso searchParams={searchParams} />
      </Suspense>
      <SeccionPendiente titulo="Agenda" etapa={6} />
    </>
  );
}

// exigirUsuario redirige acá cuando alguien entra a una sección que su rol no ve
async function AvisoSinPermiso({ searchParams }: Pick<PageProps<"/panel/agenda">, "searchParams">) {
  const { "sin-permiso": sinPermiso } = await searchParams;
  if (!sinPermiso) return null;
  return (
    <p role="alert" className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
      No tenés permiso para entrar a esa sección.
    </p>
  );
}
