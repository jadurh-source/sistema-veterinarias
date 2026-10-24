// Datos de demostración: veterinarias "Huellitas" (/huellitas) y "Puro Pelo" (/puropelo).
// Los turnos son relativos a la fecha en que se corre: últimas 4 semanas y próxima semana.
// Se puede correr varias veces: borra y vuelve a crear solo los datos de estas veterinarias.
// Se ejecuta con Node (sin compilar): por eso los imports llevan extensión .ts.

import { PrismaClient, Prisma } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import type {
  CategoriaServicio,
  Especie,
  EspecieServicio,
  EstadoTurno,
  MedioPago,
  OrigenTurno,
  TipoProfesional,
} from "@prisma/client";
import { diaLocal, diaSemanaLocal, localAUtc, sumarDias } from "../src/lib/fechas.ts";

const db = new PrismaClient();
const ZONA = "America/Argentina/Tucuman";

// Azar con semilla fija: el seed genera siempre la misma agenda para un mismo día
let semilla = 20261024;
function azar(): number {
  semilla = (semilla + 0x6d2b79f5) | 0;
  let t = Math.imul(semilla ^ (semilla >>> 15), 1 | semilla);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
function elegir<T>(lista: readonly T[]): T {
  return lista[Math.floor(azar() * lista.length)];
}

function aMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}
function aHora(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
}
/** Columnas @db.Date: medianoche UTC del día local. */
function soloFecha(dia: string): Date {
  return new Date(`${dia}T00:00:00.000Z`);
}

async function borrarDemo(slug: string) {
  const vet = await db.veterinaria.findUnique({ where: { slug } });
  if (!vet) return;
  const where = { veterinariaId: vet.id };
  await db.aplicacionVacuna.deleteMany({ where });
  await db.pago.deleteMany({ where: { ...where, anulaPagoId: { not: null } } });
  await db.pago.deleteMany({ where });
  await db.turno.deleteMany({ where });
  await db.mascota.deleteMany({ where });
  await db.cliente.deleteMany({ where });
  await db.bloqueo.deleteMany({ where });
  await db.horarioAtencion.deleteMany({ where });
  await db.servicio.deleteMany({ where });
  await db.profesional.deleteMany({ where });
  await db.usuario.deleteMany({ where });
  await db.veterinaria.delete({ where: { id: vet.id } });
}

const SERVICIOS: {
  nombre: string;
  categoria: CategoriaServicio;
  especie: EspecieServicio;
  duracionMin: number;
  precio: string;
  revacunacionDias?: number;
  descripcion?: string;
}[] = [
  { nombre: "Consulta clínica", categoria: "CLINICA", especie: "TODAS", duracionMin: 30, precio: "18000", descripcion: "Revisión general, diagnóstico y tratamiento." },
  { nombre: "Consulta a domicilio", categoria: "CLINICA", especie: "TODAS", duracionMin: 60, precio: "32000", descripcion: "Atención en tu casa dentro de la zona de cobertura." },
  { nombre: "Vacuna antirrábica", categoria: "PREVENCION", especie: "TODAS", duracionMin: 15, precio: "15000", revacunacionDias: 365 },
  { nombre: "Vacuna séxtuple", categoria: "PREVENCION", especie: "PERRO", duracionMin: 15, precio: "22000", revacunacionDias: 365 },
  { nombre: "Vacuna triple felina", categoria: "PREVENCION", especie: "GATO", duracionMin: 15, precio: "20000", revacunacionDias: 365 },
  { nombre: "Desparasitación", categoria: "PREVENCION", especie: "TODAS", duracionMin: 15, precio: "9000" },
  { nombre: "Baño y corte perro chico", categoria: "ESTETICA", especie: "PERRO", duracionMin: 60, precio: "25000" },
  { nombre: "Baño y corte perro grande", categoria: "ESTETICA", especie: "PERRO", duracionMin: 90, precio: "38000" },
  { nombre: "Castración gato", categoria: "CIRUGIA", especie: "GATO", duracionMin: 90, precio: "65000" },
  { nombre: "Castración perro", categoria: "CIRUGIA", especie: "PERRO", duracionMin: 120, precio: "95000" },
  { nombre: "Ecografía", categoria: "DIAGNOSTICO", especie: "TODAS", duracionMin: 30, precio: "35000" },
  { nombre: "Análisis de sangre", categoria: "DIAGNOSTICO", especie: "TODAS", duracionMin: 15, precio: "28000" },
];

const CLIENTES: { nombre: string; mascotas: { nombre: string; especie: Especie; raza?: string; sexo: "MACHO" | "HEMBRA" }[] }[] = [
  { nombre: "Lucía Fernández", mascotas: [{ nombre: "Toby", especie: "PERRO", raza: "Caniche", sexo: "MACHO" }] },
  { nombre: "Martín Gómez", mascotas: [{ nombre: "Luna", especie: "GATO", raza: "Común europeo", sexo: "HEMBRA" }, { nombre: "Simba", especie: "GATO", sexo: "MACHO" }] },
  { nombre: "Sofía Díaz", mascotas: [{ nombre: "Rocco", especie: "PERRO", raza: "Labrador", sexo: "MACHO" }] },
  { nombre: "Juan Pablo Ruiz", mascotas: [{ nombre: "Mora", especie: "PERRO", raza: "Mestiza", sexo: "HEMBRA" }] },
  { nombre: "Valentina López", mascotas: [{ nombre: "Milo", especie: "GATO", raza: "Siamés", sexo: "MACHO" }, { nombre: "Kira", especie: "PERRO", raza: "Border collie", sexo: "HEMBRA" }] },
  { nombre: "Diego Romero", mascotas: [{ nombre: "Bruno", especie: "PERRO", raza: "Bulldog francés", sexo: "MACHO" }] },
  { nombre: "Camila Sosa", mascotas: [{ nombre: "Nala", especie: "GATO", sexo: "HEMBRA" }] },
  { nombre: "Federico Álvarez", mascotas: [{ nombre: "Thor", especie: "PERRO", raza: "Ovejero alemán", sexo: "MACHO" }, { nombre: "Pelusa", especie: "OTRO", raza: "Conejo", sexo: "HEMBRA" }] },
  { nombre: "Agustina Torres", mascotas: [{ nombre: "Lola", especie: "PERRO", raza: "Golden retriever", sexo: "HEMBRA" }] },
  { nombre: "Nicolás Herrera", mascotas: [{ nombre: "Oliver", especie: "GATO", raza: "Persa", sexo: "MACHO" }] },
  { nombre: "María José Medina", mascotas: [{ nombre: "Chispa", especie: "PERRO", raza: "Jack Russell", sexo: "HEMBRA" }, { nombre: "Michi", especie: "GATO", sexo: "MACHO" }] },
  { nombre: "Ramiro Castro", mascotas: [{ nombre: "Zeus", especie: "PERRO", raza: "Rottweiler", sexo: "MACHO" }] },
  { nombre: "Florencia Ríos", mascotas: [{ nombre: "Canela", especie: "PERRO", raza: "Cocker", sexo: "HEMBRA" }] },
  { nombre: "Gonzalo Acosta", mascotas: [{ nombre: "Tom", especie: "GATO", sexo: "MACHO" }, { nombre: "Frida", especie: "GATO", sexo: "HEMBRA" }] },
  { nombre: "Paula Benítez", mascotas: [{ nombre: "Coco", especie: "PERRO", raza: "Shih tzu", sexo: "MACHO" }] },
];

const ORIGENES: OrigenTurno[] = ["WEB", "WEB", "WEB", "WEB", "WHATSAPP", "WHATSAPP", "WHATSAPP", "MOSTRADOR", "MOSTRADOR", "TELEFONO"];
const MEDIOS: MedioPago[] = ["EFECTIVO", "EFECTIVO", "TRANSFERENCIA", "TRANSFERENCIA", "MERCADO_PAGO", "MERCADO_PAGO", "DEBITO", "CREDITO"];

function especieCompatible(servicio: EspecieServicio, mascota: Especie): boolean {
  return servicio === "TODAS" || servicio === mascota;
}

type Demo = {
  veterinaria: { slug: string; nombre: string; eslogan: string; colorPrimario: string; direccion: string | null; whatsapp: string; email: string | null };
  dueno: { nombre: string; email: string };
  recepcion: { nombre: string; email: string };
  profesionales: { nombre: string; tipo: TipoProfesional; categorias: CategoriaServicio[] }[];
  semilla: number;
};

const DEMOS: Demo[] = [
  {
    veterinaria: {
      slug: "huellitas",
      nombre: "Veterinaria Huellitas",
      eslogan: "Cuidamos a tu mejor amigo como parte de la familia",
      colorPrimario: "#1f6b5a",
      direccion: "Av. Mate de Luna 2450, San Miguel de Tucumán",
      whatsapp: "+5493815550100",
      email: "hola@huellitas.demo",
    },
    dueno: { nombre: "Laura Paz", email: "dueno@demo.com" },
    recepcion: { nombre: "Carla Núñez", email: "recepcion@demo.com" },
    profesionales: [
      { nombre: "Dra. Ana Morales", tipo: "VETERINARIO", categorias: ["CLINICA", "PREVENCION", "CIRUGIA", "DIAGNOSTICO"] },
      { nombre: "Dr. Pablo Vega", tipo: "VETERINARIO", categorias: ["CLINICA", "PREVENCION", "DIAGNOSTICO"] },
      { nombre: "Sol Giménez", tipo: "PELUQUERO", categorias: ["ESTETICA"] },
    ],
    semilla: 20261024,
  },
  {
    // Demo para mostrarle a Veterinaria Puro Pelo: nombre, color y doctoras de su Instagram.
    // Dirección, WhatsApp y precios son de ejemplo hasta tener los reales.
    veterinaria: {
      slug: "puropelo",
      nombre: "Puro Pelo",
      eslogan: "Cuidamos cada puro pelo como si fuera propio",
      colorPrimario: "#2f6a96",
      direccion: null,
      whatsapp: "+5493815550200",
      email: null,
    },
    dueno: { nombre: "Dueña Puro Pelo", email: "dueno@puropelo.demo" },
    recepcion: { nombre: "Recepción Puro Pelo", email: "recepcion@puropelo.demo" },
    profesionales: [
      { nombre: "Dra. Fer", tipo: "VETERINARIO", categorias: ["CLINICA", "PREVENCION", "CIRUGIA", "DIAGNOSTICO"] },
      { nombre: "Dra. Agus", tipo: "VETERINARIO", categorias: ["CLINICA", "PREVENCION", "DIAGNOSTICO"] },
      { nombre: "Dra. Ayu", tipo: "VETERINARIO", categorias: ["CLINICA", "PREVENCION", "DIAGNOSTICO"] },
      { nombre: "Peluquería Puro Pelo", tipo: "PELUQUERO", categorias: ["ESTETICA"] },
    ],
    semilla: 20260806,
  },
];

async function sembrar(demo: Demo) {
  semilla = demo.semilla;
  await borrarDemo(demo.veterinaria.slug);

  const vet = await db.veterinaria.create({ data: { ...demo.veterinaria, zonaHoraria: ZONA } });
  const veterinariaId = vet.id;

  const [dueno, recepcion] = await Promise.all([
    db.usuario.create({ data: { veterinariaId, ...demo.dueno, rol: "DUENO" } }),
    db.usuario.create({ data: { veterinariaId, ...demo.recepcion, rol: "RECEPCION" } }),
  ]);

  // Contraseña de los dos usuarios de demo, desde DEMO_PASSWORD (.env o Variables de Railway)
  const contrasena = process.env.DEMO_PASSWORD;
  if (contrasena && contrasena.length >= 8) {
    const hash = await hashPassword(contrasena);
    for (const usuario of [dueno, recepcion]) {
      await db.cuenta.create({
        data: { id: crypto.randomUUID(), usuarioId: usuario.id, cuentaId: usuario.id, proveedorId: "credential", contrasena: hash },
      });
    }
  } else {
    console.warn("Sin DEMO_PASSWORD (mínimo 8 caracteres): los usuarios de demo no van a poder ingresar.");
  }

  const profesionales = await db.profesional.createManyAndReturn({
    data: demo.profesionales.map((p) => ({ veterinariaId, ...p })),
  });

  // Lunes a viernes 9 a 13 y 17 a 21; sábado 9 a 13
  const franjas: { diaSemana: number; desde: string; hasta: string }[] = [];
  for (let d = 1; d <= 5; d++) {
    franjas.push({ diaSemana: d, desde: "09:00", hasta: "13:00" }, { diaSemana: d, desde: "17:00", hasta: "21:00" });
  }
  franjas.push({ diaSemana: 6, desde: "09:00", hasta: "13:00" });
  await db.horarioAtencion.createMany({ data: franjas.map((f) => ({ veterinariaId, ...f })) });

  const servicios = await db.servicio.createManyAndReturn({
    data: SERVICIOS.map((s, i) => ({ veterinariaId, orden: i + 1, ...s, precio: new Prisma.Decimal(s.precio) })),
  });

  const clientes = [];
  for (const [i, c] of CLIENTES.entries()) {
    clientes.push(
      await db.cliente.create({
        data: {
          veterinariaId,
          nombre: c.nombre,
          telefono: `+54938155${String(10001 + i * 137).padStart(5, "0")}`,
          mascotas: {
            create: c.mascotas.map((m) => ({
              veterinariaId,
              ...m,
              fechaNacimiento: soloFecha(sumarDias(diaLocal(new Date(), ZONA), -Math.floor(200 + azar() * 3500))),
              pesoKg: m.especie === "PERRO" ? new Prisma.Decimal((4 + azar() * 30).toFixed(1)) : new Prisma.Decimal((2.5 + azar() * 3).toFixed(1)),
            })),
          },
        },
        include: { mascotas: true },
      }),
    );
  }
  const mascotas = clientes.flatMap((c) => c.mascotas);

  const ahora = new Date();
  const hoy = diaLocal(ahora, ZONA);

  // El segundo profesional tiene un día de capacitación dentro de 3 días
  const diaBloqueo = sumarDias(hoy, 3);
  const enCapacitacion = profesionales[1];
  await db.bloqueo.create({
    data: { veterinariaId, profesionalId: enCapacitacion.id, inicio: localAUtc(diaBloqueo, "00:00", ZONA), fin: localAUtc(sumarDias(diaBloqueo, 1), "00:00", ZONA), motivo: "Capacitación" },
  });

  // Agenda: de hace 28 días a dentro de 7, respetando franjas, categorías y sin superponer
  const ocupados = new Map<string, { inicio: number; fin: number }[]>(profesionales.map((p) => [p.id, []]));
  const turnos: Prisma.TurnoCreateManyInput[] = [];

  for (let offset = -28; offset <= 7; offset++) {
    const dia = sumarDias(hoy, offset);
    const diaSemana = diaSemanaLocal(localAUtc(dia, "12:00", ZONA), ZONA);
    const pasado = offset < 0;

    for (const franja of franjas.filter((f) => f.diaSemana === diaSemana)) {
      for (let min = aMinutos(franja.desde); min < aMinutos(franja.hasta); min += 30) {
        if (azar() > (pasado ? 0.55 : 0.4)) continue;

        const profesional = elegir(profesionales);
        if (profesional.id === enCapacitacion.id && dia === diaBloqueo) continue;
        const servicio = elegir(servicios.filter((s) => profesional.categorias.includes(s.categoria)));
        if (min + servicio.duracionMin > aMinutos(franja.hasta)) continue;

        const inicio = localAUtc(dia, aHora(min), ZONA);
        const fin = new Date(inicio.getTime() + servicio.duracionMin * 60_000);
        const agenda = ocupados.get(profesional.id)!;
        if (agenda.some((t) => inicio.getTime() < t.fin && t.inicio < fin.getTime())) continue;

        const candidatas = mascotas.filter((m) => especieCompatible(servicio.especie, m.especie));
        if (candidatas.length === 0) continue;
        const mascota = elegir(candidatas);

        const origen = elegir(ORIGENES);
        let estado: EstadoTurno;
        if (fin < ahora) {
          const r = azar();
          estado = r < 0.84 ? "ATENDIDO" : r < 0.93 ? "AUSENTE" : "CANCELADO";
        } else {
          estado = origen === "WEB" && azar() < 0.6 ? "PENDIENTE" : "CONFIRMADO";
        }

        agenda.push({ inicio: inicio.getTime(), fin: fin.getTime() });
        turnos.push({
          veterinariaId,
          inicio,
          fin,
          servicioId: servicio.id,
          profesionalId: profesional.id,
          clienteId: mascota.clienteId,
          mascotaId: mascota.id,
          estado,
          origen,
          precioAcordado: servicio.precio,
          comentarioCliente: origen === "WEB" && azar() < 0.3 ? "Es un poco nervioso/a, gracias." : null,
          creadoPorId: origen === "WEB" ? null : recepcion.id,
        });
      }
    }
  }

  const creados = await db.turno.createManyAndReturn({ data: turnos });
  const servicioPorId = new Map(servicios.map((s) => [s.id, s]));

  // Cobros: la mayoría de los atendidos cobrados; algunos en dos partes y algunos sin cobrar
  const pagos: Prisma.PagoCreateManyInput[] = [];
  const vacunas: Prisma.AplicacionVacunaCreateManyInput[] = [];
  for (const t of creados.filter((t) => t.estado === "ATENDIDO")) {
    const r = azar();
    const base = { veterinariaId, turnoId: t.id, clienteId: t.clienteId, registradoPorId: azar() < 0.8 ? recepcion.id : dueno.id };
    if (r < 0.88) {
      pagos.push({ ...base, monto: t.precioAcordado, medio: elegir(MEDIOS), fecha: t.fin });
    } else if (r < 0.95) {
      const mitad = t.precioAcordado.div(2).toDecimalPlaces(0);
      pagos.push({ ...base, monto: mitad, medio: "EFECTIVO", fecha: t.fin, nota: "Pago en dos partes" });
      pagos.push({ ...base, monto: t.precioAcordado.minus(mitad), medio: "TRANSFERENCIA", fecha: new Date(t.fin.getTime() + 2 * 86_400_000) });
    } // el resto queda atendido sin cobrar

    const servicio = servicioPorId.get(t.servicioId)!;
    if (servicio.revacunacionDias) {
      const fecha = diaLocal(t.inicio, ZONA);
      vacunas.push({ veterinariaId, mascotaId: t.mascotaId, servicioId: servicio.id, turnoId: t.id, fecha: soloFecha(fecha), vence: soloFecha(sumarDias(fecha, servicio.revacunacionDias)) });
    }
  }
  const pagosCreados = await db.pago.createManyAndReturn({ data: pagos });

  // Ejemplo de anulación: un pago cargado con el medio equivocado se anula y se vuelve a cargar
  const equivocado = pagosCreados.find((p) => p.medio === "CREDITO");
  if (equivocado) {
    await db.pago.create({
      data: { veterinariaId, turnoId: equivocado.turnoId, clienteId: equivocado.clienteId, monto: equivocado.monto.negated(), medio: equivocado.medio, fecha: new Date(equivocado.fecha.getTime() + 10 * 60_000), registradoPorId: dueno.id, anulaPagoId: equivocado.id, nota: "Anulado: se cargó con el medio equivocado" },
    });
    await db.pago.create({
      data: { veterinariaId, turnoId: equivocado.turnoId, clienteId: equivocado.clienteId, monto: equivocado.monto, medio: "DEBITO", fecha: new Date(equivocado.fecha.getTime() + 11 * 60_000), registradoPorId: dueno.id },
    });
  }

  // Vacunas previas (de la libreta sanitaria): una al día, una por vencer y una vencida
  const antirrabica = servicios.find((s) => s.nombre === "Vacuna antirrábica")!;
  for (const [mascota, haceDias] of [[mascotas[0], 200], [mascotas[2], 345], [mascotas[5], 420]] as const) {
    const fecha = sumarDias(hoy, -haceDias);
    vacunas.push({ veterinariaId, mascotaId: mascota.id, servicioId: antirrabica.id, fecha: soloFecha(fecha), vence: soloFecha(sumarDias(fecha, 365)) });
  }
  await db.aplicacionVacuna.createMany({ data: vacunas });

  const contar = (estado: EstadoTurno) => creados.filter((t) => t.estado === estado).length;
  console.log(`${demo.veterinaria.nombre} lista: ${servicios.length} servicios, ${clientes.length} clientes, ${mascotas.length} mascotas.`);
  console.log(
    `Turnos: ${creados.length} (atendidos ${contar("ATENDIDO")}, ausentes ${contar("AUSENTE")}, cancelados ${contar("CANCELADO")}, confirmados ${contar("CONFIRMADO")}, pendientes ${contar("PENDIENTE")}).`,
  );
  console.log(`Pagos: ${pagosCreados.length + (equivocado ? 2 : 0)} · Vacunas: ${vacunas.length}.`);
}

async function main() {
  for (const demo of DEMOS) await sembrar(demo);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
