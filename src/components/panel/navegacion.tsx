import Link from "next/link";
import type { Rol } from "@prisma/client";
import { obtenerUsuario } from "@/lib/tenant";
import { contarPendientes } from "@/lib/agenda";
import { BotonSalir } from "@/components/panel/boton-salir";

// Secciones del panel y quién las ve (docs/04-reglas-negocio.md, sección 8).
// Recepción ve Servicios en modo lectura y Caja solo con el resumen del día.
const SECCIONES: { href: string; nombre: string; roles: Rol[] }[] = [
  { href: "/panel/agenda", nombre: "Agenda", roles: ["DUENO", "RECEPCION"] },
  { href: "/panel/clientes", nombre: "Clientes", roles: ["DUENO", "RECEPCION"] },
  { href: "/panel/servicios", nombre: "Servicios", roles: ["DUENO", "RECEPCION"] },
  { href: "/panel/caja", nombre: "Caja", roles: ["DUENO", "RECEPCION"] },
  { href: "/panel/configuracion", nombre: "Configuración", roles: ["DUENO"] },
];

const NOMBRE_ROL: Record<Rol, string> = { DUENO: "Dueño", RECEPCION: "Recepción" };

export async function Navegacion() {
  const usuario = await obtenerUsuario();
  if (!usuario) return null;
  const pendientes = await contarPendientes(usuario.veterinariaId, new Date());

  return (
    <>
      <nav className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {SECCIONES.filter((s) => s.roles.includes(usuario.rol)).map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
          >
            {s.nombre}
            {s.href === "/panel/agenda" && pendientes > 0 && (
              <span className="rounded-full bg-amber-500 px-1.5 text-xs font-semibold text-white" title="Reservas pendientes de confirmar">
                {pendientes}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-3 text-sm sm:ml-auto">
        <span className="text-zinc-600">
          {usuario.nombre} · <span className="text-zinc-500">{NOMBRE_ROL[usuario.rol]}</span>
        </span>
        <BotonSalir />
      </div>
    </>
  );
}
