import { Suspense } from "react";
import Link from "next/link";
import { db } from "@/lib/db";
import { exigirUsuario } from "@/lib/tenant";
import { profesionalesActivos, resumenDelDia, turnosEntre, type TurnoAgenda } from "@/lib/agenda";
import { describirDia, diaLocal, diaSemanaLocal, horaLocal, localAUtc, partesDelDia, sumarDias } from "@/lib/fechas";
import { formatearPesos } from "@/lib/dinero";
import { NOMBRE_ESTADO } from "@/lib/estados-turno";
import { COLOR_ESTADO, EMOJI_ESPECIE, TarjetaTurno } from "@/components/panel/agenda/tarjeta-turno";
import { FiltroProfesional } from "@/components/panel/agenda/filtro-profesional";

// Agenda del panel (docs/02-modulos.md, B1): vista día (por defecto hoy) y semana.

export default function Agenda(props: PageProps<"/panel/agenda">) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Cargando agenda…</p>}>
      <Contenido {...props} />
    </Suspense>
  );
}

const texto = (v: string | string[] | undefined) => (typeof v === "string" ? v : undefined);
const DIA_VALIDO = /^\d{4}-\d{2}-\d{2}$/;

async function Contenido({ searchParams }: PageProps<"/panel/agenda">) {
  const usuario = await exigirUsuario();
  const sp = await searchParams;
  const vet = await db.veterinaria.findUniqueOrThrow({
    where: { id: usuario.veterinariaId },
    select: { nombre: true, zonaHoraria: true },
  });
  const zona = vet.zonaHoraria;
  const ahora = new Date();
  const hoy = diaLocal(ahora, zona);
  const dia = DIA_VALIDO.test(texto(sp.dia) ?? "") ? texto(sp.dia)! : hoy;
  const vista = texto(sp.vista) === "semana" ? "semana" : "dia";
  const profesionales = await profesionalesActivos(usuario.veterinariaId);
  const profesionalId = profesionales.find((p) => p.id === texto(sp.profesional))?.id;

  // Enlaces que conservan los filtros elegidos
  const enlace = (cambios: { dia?: string; vista?: string; profesional?: string | null }) => {
    const p = new URLSearchParams();
    const v = cambios.vista ?? vista;
    if (v === "semana") p.set("vista", "semana");
    p.set("dia", cambios.dia ?? dia);
    const prof = cambios.profesional === null ? undefined : (cambios.profesional ?? profesionalId);
    if (prof) p.set("profesional", prof);
    return `/panel/agenda?${p.toString()}`;
  };
  const paso = vista === "semana" ? 7 : 1;
  const lunes = sumarDias(dia, -((diaSemanaLocal(localAUtc(dia, "12:00", zona), zona) + 6) % 7));

  return (
    <div className="flex flex-col gap-5">
      {texto(sp["sin-permiso"]) && (
        <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          No tenés permiso para entrar a esa sección.
        </p>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">Agenda</h1>
          <p className="text-sm text-zinc-600 first-letter:uppercase">
            {vista === "dia" ? describirDia(dia, hoy) : `Semana del ${describirDia(lunes, hoy)}`}
          </p>
        </div>
        <Link href="/panel/agenda/nuevo" className="rounded-lg bg-emerald-800 px-4 py-2.5 text-center font-medium text-white hover:bg-emerald-900">
          + Nuevo turno
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex overflow-hidden rounded-lg border border-zinc-300 bg-white text-sm">
          <Link href={enlace({ dia: sumarDias(dia, -paso) })} className="px-3 py-2 hover:bg-zinc-100" aria-label="Anterior">‹</Link>
          <Link href={enlace({ dia: hoy })} className="border-x border-zinc-300 px-3 py-2 hover:bg-zinc-100">Hoy</Link>
          <Link href={enlace({ dia: sumarDias(dia, paso) })} className="px-3 py-2 hover:bg-zinc-100" aria-label="Siguiente">›</Link>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-zinc-300 bg-white text-sm">
          <Link href={enlace({ vista: "dia" })} className={`px-3 py-2 ${vista === "dia" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}>Día</Link>
          <Link href={enlace({ vista: "semana" })} className={`px-3 py-2 ${vista === "semana" ? "bg-zinc-900 text-white" : "hover:bg-zinc-100"}`}>Semana</Link>
        </div>
        <FiltroProfesional
          profesionales={profesionales}
          elegido={profesionalId}
          base={`${enlace({ profesional: null })}&`}
        />
      </div>

      {vista === "dia" ? (
        <VistaDia veterinariaId={usuario.veterinariaId} dia={dia} zona={zona} veterinaria={vet.nombre} ahora={ahora} profesionalId={profesionalId} />
      ) : (
        <VistaSemana
          veterinariaId={usuario.veterinariaId}
          lunes={lunes}
          hoy={hoy}
          zona={zona}
          profesionalId={profesionalId}
          enlaceDia={(d) => enlace({ dia: d, vista: "dia" })}
        />
      )}
    </div>
  );
}

async function VistaDia(props: { veterinariaId: string; dia: string; zona: string; veterinaria: string; ahora: Date; profesionalId?: string }) {
  const { veterinariaId, dia, zona, profesionalId } = props;
  const [turnos, resumen] = await Promise.all([
    turnosEntre(veterinariaId, dia, dia, zona, profesionalId),
    resumenDelDia(veterinariaId, dia, zona, profesionalId),
  ]);
  // Mañana y tarde: corte a las 14 hs
  const tarde = localAUtc(dia, "14:00", zona);
  const grupos = [
    { titulo: "Mañana", turnos: turnos.filter((t) => t.inicio < tarde) },
    { titulo: "Tarde", turnos: turnos.filter((t) => t.inicio >= tarde) },
  ];

  return (
    <>
      <dl className="grid grid-cols-3 gap-3">
        <Dato titulo="Turnos" valor={String(resumen.turnos)} />
        <Dato titulo="Pendientes de confirmar" valor={String(resumen.pendientes)} resaltar={resumen.pendientes > 0} />
        <Dato titulo="Cobrado" valor={formatearPesos(resumen.cobrado)} />
      </dl>

      {turnos.length === 0 && <p className="rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">No hay turnos este día.</p>}

      {grupos.map(
        (g) =>
          g.turnos.length > 0 && (
            <section key={g.titulo} className="flex flex-col gap-3">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{g.titulo}</h2>
              <ul className="flex flex-col gap-3">
                {g.turnos.map((t) => (
                  <TarjetaTurno key={t.id} turno={t} zona={zona} veterinaria={props.veterinaria} ahora={props.ahora} />
                ))}
              </ul>
            </section>
          ),
      )}
    </>
  );
}

function Dato({ titulo, valor, resaltar }: { titulo: string; valor: string; resaltar?: boolean }) {
  return (
    <div className={`rounded-2xl border p-3 sm:p-4 ${resaltar ? "border-amber-200 bg-amber-50" : "border-zinc-200 bg-white"}`}>
      <dt className="text-xs text-zinc-600 sm:text-sm">{titulo}</dt>
      <dd className="mt-1 text-xl font-semibold text-zinc-900 sm:text-2xl">{valor}</dd>
    </div>
  );
}

async function VistaSemana(props: {
  veterinariaId: string;
  lunes: string;
  hoy: string;
  zona: string;
  profesionalId?: string;
  enlaceDia: (dia: string) => string;
}) {
  const { lunes, zona } = props;
  const domingo = sumarDias(lunes, 6);
  const turnos = await turnosEntre(props.veterinariaId, lunes, domingo, zona, props.profesionalId);
  const dias = Array.from({ length: 7 }, (_, i) => sumarDias(lunes, i));
  const porDia = (d: string) => turnos.filter((t: TurnoAgenda) => diaLocal(t.inicio, zona) === d);

  return (
    <div className="grid gap-3 md:grid-cols-7">
      {dias.map((d) => {
        const p = partesDelDia(d);
        const lista = porDia(d);
        return (
          <section key={d} className={`flex flex-col gap-2 rounded-2xl border bg-white p-3 ${d === props.hoy ? "border-emerald-700" : "border-zinc-200"}`}>
            <Link href={props.enlaceDia(d)} className="flex items-baseline justify-between hover:underline">
              <span className="text-sm font-semibold capitalize text-zinc-900">
                {p.semana} {p.numero}
              </span>
              <span className="text-xs text-zinc-500">{lista.filter((t) => t.estado !== "CANCELADO").length} turnos</span>
            </Link>
            <ul className="flex flex-col gap-1.5">
              {lista.map((t) => (
                <li key={t.id} className={`rounded-lg px-2 py-1.5 text-xs ${COLOR_ESTADO[t.estado]} ${t.estado === "CANCELADO" ? "line-through" : ""}`} title={NOMBRE_ESTADO[t.estado]}>
                  <span className="font-semibold">{horaLocal(t.inicio, zona)}</span> {EMOJI_ESPECIE[t.mascota.especie]} {t.mascota.nombre}
                  <span className="block truncate opacity-80">{t.servicio.nombre}</span>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
