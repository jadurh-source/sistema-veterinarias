import { Suspense } from "react";
import { connection } from "next/server";
import { db } from "@/lib/db";

// Página provisoria de la Etapa 0: confirma que la app y la base responden en Railway.
export default function Inicio() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-3xl font-semibold">Hola 👋</h1>
      <p className="text-zinc-600">Sistema web para veterinarias — en construcción.</p>
      <Suspense fallback={<p className="text-sm text-zinc-500">Revisando la base…</p>}>
        <EstadoBase />
      </Suspense>
    </main>
  );
}

async function EstadoBase() {
  // La consulta se hace en cada pedido, no al compilar: en el build no hay base.
  await connection();
  const conectada = await db.$queryRaw`SELECT 1`.then(
    () => true,
    () => false,
  );

  return conectada ? (
    <p className="text-sm text-emerald-700">Base de datos conectada ✓</p>
  ) : (
    <p className="text-sm text-red-700">No se pudo conectar a la base de datos.</p>
  );
}
