import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { FormularioIngreso } from "@/components/panel/formulario-ingreso";
import { obtenerUsuario } from "@/lib/tenant";

export const metadata: Metadata = { title: "Ingresar al panel" };

export default function Ingresar() {
  return (
    <main className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">Ingresá al panel</h1>
        <p className="mt-1 text-sm text-zinc-600">Usá el email y la contraseña que te dio la veterinaria.</p>
        <Suspense fallback={<FormularioIngreso />}>
          <SiYaIngreso>
            <FormularioIngreso />
          </SiYaIngreso>
        </Suspense>
      </div>
    </main>
  );
}

// Si ya hay una sesión válida, no tiene sentido mostrar el formulario
async function SiYaIngreso({ children }: { children: React.ReactNode }) {
  if (await obtenerUsuario()) redirect("/panel/agenda");
  return children;
}
