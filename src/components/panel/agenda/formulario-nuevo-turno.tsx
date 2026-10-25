"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Especie, EspecieServicio } from "@prisma/client";
import { buscarClientes, crearTurno } from "@/server/turnos";
import { especieCompatible } from "@/lib/disponibilidad";
import { SelectorHorario, type HorarioElegido } from "@/components/panel/agenda/selector-horario";

type ServicioOpcion = { id: string; nombre: string; especie: EspecieServicio; duracion: string; precio: string };
type ClienteEncontrado = { id: string; nombre: string; telefono: string; mascotas: { id: string; nombre: string; especie: Especie }[] };

const ESPECIES: { valor: Especie; nombre: string }[] = [
  { valor: "PERRO", nombre: "Perro" },
  { valor: "GATO", nombre: "Gato" },
  { valor: "OTRO", nombre: "Otra" },
];
const campo = "rounded-lg border border-zinc-300 px-3 py-2";

export function FormularioNuevoTurno({ servicios, hoy }: { servicios: ServicioOpcion[]; hoy: string }) {
  const router = useRouter();
  const [enviando, iniciar] = useTransition();

  // Cliente
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<ClienteEncontrado[]>([]);
  const [cliente, setCliente] = useState<ClienteEncontrado | null>(null);
  const [clienteNuevo, setClienteNuevo] = useState(false);
  const [nombreCliente, setNombreCliente] = useState("");
  const [telefono, setTelefono] = useState("");

  // Mascota
  const [mascotaId, setMascotaId] = useState<string | "nueva" | null>(null);
  const [nombreMascota, setNombreMascota] = useState("");
  const [especieNueva, setEspecieNueva] = useState<Especie>("PERRO");

  // Turno
  const [servicioId, setServicioId] = useState("");
  const [horario, setHorario] = useState<HorarioElegido | null>(null);
  const [origen, setOrigen] = useState<"MOSTRADOR" | "WHATSAPP" | "TELEFONO">("MOSTRADOR");
  const [notas, setNotas] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [advertencia, setAdvertencia] = useState<string | null>(null);

  // Búsqueda de clientes con una pausa corta mientras se escribe
  useEffect(() => {
    if (busqueda.trim().length < 2) return;
    const espera = setTimeout(async () => {
      const r = await buscarClientes({ texto: busqueda });
      setResultados(r.ok ? r.datos : []);
    }, 300);
    return () => clearTimeout(espera);
  }, [busqueda]);

  const mascotaElegida = cliente?.mascotas.find((m) => m.id === mascotaId);
  const especie: Especie | null = mascotaElegida?.especie ?? (mascotaId === "nueva" || clienteNuevo ? especieNueva : null);
  const serviciosPosibles = especie ? servicios.filter((s) => especieCompatible(s.especie, especie)) : [];
  const listo = (cliente || (clienteNuevo && nombreCliente && telefono)) && especie && servicioId && horario;

  function enviar(forzar: boolean) {
    if (!listo || !horario) return;
    setError(null);
    iniciar(async () => {
      const r = await crearTurno({
        cliente: cliente ? { id: cliente.id } : { nombre: nombreCliente, telefono },
        mascota: mascotaElegida ? { id: mascotaElegida.id } : { nombre: nombreMascota, especie: especieNueva },
        servicioId,
        inicio: horario.inicio,
        profesionalId: horario.profesionalId,
        origen,
        notasInternas: notas || undefined,
        forzar,
      });
      if (!r.ok) return setError(r.error);
      if ("error" in r.datos) return setError(r.datos.error);
      if ("advertencia" in r.datos) return setAdvertencia(r.datos.advertencia ?? null);
      router.push(`/panel/agenda?dia=${r.datos.dia}`);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Cliente */}
      <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold text-zinc-900">1. Cliente</h2>
        {cliente ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-zinc-50 px-3 py-2">
            <span>
              <span className="font-medium">{cliente.nombre}</span> <span className="text-sm text-zinc-500">{cliente.telefono}</span>
            </span>
            <button type="button" onClick={() => { setCliente(null); setMascotaId(null); }} className="text-sm text-emerald-800 underline">
              Cambiar
            </button>
          </div>
        ) : clienteNuevo ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <input placeholder="Nombre y apellido" value={nombreCliente} onChange={(e) => setNombreCliente(e.target.value)} className={campo} />
            <input placeholder="WhatsApp (381 555 1234)" inputMode="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} className={campo} />
            <button type="button" onClick={() => setClienteNuevo(false)} className="text-left text-sm text-emerald-800 underline">
              Buscar un cliente existente
            </button>
          </div>
        ) : (
          <>
            <input
              placeholder="Buscar por nombre, teléfono o mascota"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={campo}
              autoFocus
            />
            {busqueda.trim().length >= 2 && (
              <ul className="flex flex-col divide-y divide-zinc-100 rounded-lg border border-zinc-200">
                {resultados.length === 0 && <li className="px-3 py-2 text-sm text-zinc-500">Sin resultados.</li>}
                {resultados.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => { setCliente(c); setMascotaId(c.mascotas[0]?.id ?? "nueva"); }} className="w-full px-3 py-2 text-left hover:bg-zinc-50">
                      <span className="font-medium">{c.nombre}</span> <span className="text-sm text-zinc-500">{c.telefono}</span>
                      <span className="block text-sm text-zinc-600">{c.mascotas.map((m) => m.nombre).join(", ") || "Sin mascotas"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => { setClienteNuevo(true); setMascotaId("nueva"); }} className="self-start text-sm text-emerald-800 underline">
              + Cliente nuevo
            </button>
          </>
        )}
      </section>

      {/* 2. Mascota */}
      {(cliente || clienteNuevo) && (
        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold text-zinc-900">2. Mascota</h2>
          {cliente && (
            <div className="flex flex-wrap gap-2">
              {cliente.mascotas.map((m) => (
                <button key={m.id} type="button" onClick={() => { setMascotaId(m.id); setServicioId(""); }} className={`rounded-lg border px-3 py-1.5 text-sm ${mascotaId === m.id ? "border-emerald-800 bg-emerald-800 text-white" : "border-zinc-300 hover:bg-zinc-100"}`}>
                  {m.nombre}
                </button>
              ))}
              <button type="button" onClick={() => { setMascotaId("nueva"); setServicioId(""); }} className={`rounded-lg border px-3 py-1.5 text-sm ${mascotaId === "nueva" ? "border-emerald-800 bg-emerald-800 text-white" : "border-zinc-300 hover:bg-zinc-100"}`}>
                + Otra mascota
              </button>
            </div>
          )}
          {(mascotaId === "nueva" || clienteNuevo) && (
            <div className="grid gap-3 sm:grid-cols-2">
              <input placeholder="Nombre de la mascota" value={nombreMascota} onChange={(e) => setNombreMascota(e.target.value)} className={campo} />
              <select value={especieNueva} onChange={(e) => { setEspecieNueva(e.target.value as Especie); setServicioId(""); }} className={campo}>
                {ESPECIES.map((e) => (
                  <option key={e.valor} value={e.valor}>{e.nombre}</option>
                ))}
              </select>
            </div>
          )}
        </section>
      )}

      {/* 3. Servicio y horario */}
      {especie && (
        <section className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold text-zinc-900">3. Servicio y horario</h2>
          <select value={servicioId} onChange={(e) => { setServicioId(e.target.value); setHorario(null); }} className={campo}>
            <option value="">Elegí el servicio</option>
            {serviciosPosibles.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre} · {s.duracion} · {s.precio}</option>
            ))}
          </select>
          <SelectorHorario key={servicioId} servicioId={servicioId} diaInicial={hoy} onCambio={setHorario} />
        </section>
      )}

      {/* 4. Origen y notas */}
      {horario && (
        <section className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4">
          <h2 className="font-semibold text-zinc-900">4. Origen</h2>
          <select value={origen} onChange={(e) => setOrigen(e.target.value as typeof origen)} className={`${campo} sm:w-56`}>
            <option value="MOSTRADOR">Mostrador</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="TELEFONO">Teléfono</option>
          </select>
          <textarea placeholder="Notas internas (opcional)" rows={2} maxLength={300} value={notas} onChange={(e) => setNotas(e.target.value)} className={campo} />
        </section>
      )}

      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>}
      {advertencia ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          <span>{advertencia}</span>
          <button type="button" onClick={() => enviar(true)} disabled={enviando} className="rounded-lg bg-amber-700 px-3 py-1.5 font-medium text-white">
            Cargar igual
          </button>
          <button type="button" onClick={() => setAdvertencia(null)} className="underline">Elegir otro</button>
        </div>
      ) : (
        <button type="button" disabled={!listo || enviando} onClick={() => enviar(false)} className="rounded-lg bg-emerald-800 px-4 py-3 font-medium text-white hover:bg-emerald-900 disabled:opacity-50">
          {enviando ? "Guardando…" : "Guardar turno"}
        </button>
      )}
    </div>
  );
}
