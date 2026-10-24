"use client";

import { useRouter } from "next/navigation";
import { authCliente } from "@/lib/auth-cliente";

export function BotonSalir() {
  const router = useRouter();

  async function salir() {
    await authCliente.signOut();
    router.replace("/ingresar");
    router.refresh();
  }

  return (
    <button onClick={salir} className="rounded-lg px-3 py-1.5 text-zinc-700 hover:bg-zinc-100">
      Salir
    </button>
  );
}
