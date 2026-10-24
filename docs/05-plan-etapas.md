# 05 — Plan de construcción por etapas

Cada etapa es chica, se prueba y se sube antes de seguir. Debajo de cada una está el texto para pegarle a Claude Code.

**Regla:** al terminar una etapa, Claude Code marca las casillas y anota acá cualquier decisión nueva.

---

## Etapa 0 — Proyecto base y primer despliegue en Railway
Desplegar algo mínimo desde el día uno evita sorpresas de hosting al final.

- [x] Proyecto Next.js 16 con TypeScript, Tailwind, ESLint, carpeta `src/`
- [x] `output: "standalone"` y script `start` según la guía de Railway
- [x] Prisma configurado con PostgreSQL local vía `npx prisma dev`
- [x] `.env.example` con todas las variables
- [x] Repositorio en GitHub (jadurh-source/sistema-veterinarias)
- [x] Proyecto en Railway con servicio app + PostgreSQL, `DATABASE_URL` como referencia, pre-deploy `npx prisma migrate deploy`
- [ ] Límite de gasto y alerta configurados en Railway
- [x] Página "Hola" visible en el dominio de Railway (https://app-production-3c13.up.railway.app)

> Leé CLAUDE.md y STACK.md. Hacé la Etapa 0 de docs/05-plan-etapas.md: creá el proyecto Next.js con el stack definido, dejá Prisma conectado a un PostgreSQL local con `npx prisma dev` y prepará todo para desplegar en Railway. Al final dame la lista exacta de pasos que tengo que hacer yo en GitHub y en el panel de Railway.

## Etapa 1 — Modelo de datos y datos de demo
- [ ] `schema.prisma` completo según docs/03-modelo-datos.md
- [ ] Primera migración
- [ ] `seed.ts` con la veterinaria "Huellitas" y datos relativos a la fecha actual
- [ ] `lib/db.ts`, `lib/fechas.ts`, `lib/dinero.ts`

> Hacé la Etapa 1. Traducí docs/03-modelo-datos.md a schema.prisma, creá la migración y el seed de demo. Antes de escribir el seed mostrame el schema para revisarlo.

## Etapa 2 — Login, roles y estructura del panel
- [ ] Better Auth con email y contraseña
- [ ] Rol y `veterinariaId` en la sesión
- [ ] `lib/tenant.ts`
- [ ] Protección de `/panel` y de cada server action por rol
- [ ] Layout del panel con navegación (Agenda, Clientes, Servicios, Caja, Configuración)

> Hacé la Etapa 2: login con Better Auth, roles DUENO y RECEPCION según docs/04-reglas-negocio.md sección 8, y el layout del panel con navegación vacía por ahora.

## Etapa 3 — Configuración y servicios
- [ ] Pantalla Configuración: datos de la veterinaria, horarios, profesionales, bloqueos
- [ ] Pantalla Servicios con edición en línea y aumento masivo por porcentaje

> Hacé la Etapa 3: pantallas de Configuración y Servicios del panel según docs/02-modulos.md (B3 y B5).

## Etapa 4 — Sitio público
- [ ] `/[slug]` con landing completa desde la base
- [ ] Color y datos de cada veterinaria aplicados
- [ ] 404 amable si el slug no existe o la veterinaria está inactiva
- [ ] Metadatos para compartir en WhatsApp e Instagram

> Hacé la Etapa 4: la landing pública en /[slug] según docs/02-modulos.md A1. Pensada para celular primero.

## Etapa 5 — Disponibilidad y reserva online
- [ ] `lib/disponibilidad.ts` con pruebas unitarias de los casos de docs/04 sección 1
- [ ] Flujo de reserva en 4 pasos
- [ ] Verificación contra doble reserva
- [ ] "Próximo turno disponible" en la portada

> Hacé la Etapa 5. Primero escribí lib/disponibilidad.ts con sus tests cubriendo todas las reglas de docs/04-reglas-negocio.md secciones 1, 2 y 7; recién después el flujo de reserva de docs/02 A2.

## Etapa 6 — Agenda
- [ ] Vista día y semana, filtro por profesional
- [ ] Acciones por estado según docs/04 sección 3
- [ ] Nuevo turno y reprogramar
- [ ] Botón WhatsApp con mensaje armado
- [ ] Contador de pendientes en la navegación

> Hacé la Etapa 6: la agenda del panel según docs/02 B1 y los estados de docs/04 sección 3.

## Etapa 7 — Clientes y mascotas
- [ ] Lista con buscador, ficha de cliente y de mascota
- [ ] Historial y estado de vacunas
- [ ] Carga de vacunas previas

> Hacé la Etapa 7: clientes y mascotas según docs/02 B2 y docs/04 secciones 5 y 6.

## Etapa 8 — Caja y reportes
- [ ] Cobrar desde la agenda (monto editable, medio, pagos parciales)
- [ ] Anulación de pagos
- [ ] Reportes por período, exportación CSV

> Hacé la Etapa 8: cobros y reportes según docs/02 B4 y docs/04 sección 4.

## Etapa 9 — Alta de una veterinaria nueva
- [ ] Script `npm run alta-veterinaria` que crea veterinaria, usuario dueño, horarios y servicios base
- [ ] Guía `docs/06-alta-cliente.md` paso a paso

> Hacé la Etapa 9: script para dar de alta una veterinaria nueva con servicios base y su usuario dueño, y documentá el procedimiento.

---

## Registro de decisiones
| Fecha | Decisión |
|---|---|
| 24/10/2026 | Stack Next.js + PostgreSQL + Prisma en Railway (ver STACK.md) |
| 24/10/2026 | Una sola aplicación multi-veterinaria, sitio público en `/[slug]` (a validar) |
| 24/10/2026 | Roles v1: Dueño y Recepción (a validar) |
| 24/10/2026 | Base local con `npx prisma dev` en lugar de Docker (la PC no soporta bien Docker Desktop; mismo esquema que Yogo Bonito). Producción sigue en Postgres de Railway |
| 24/10/2026 | Vitest como runner de tests (aprobado) |
| 24/10/2026 | Next.js 16.4.3 y Prisma 6.19 (misma línea que Yogo Bonito; Prisma 7 pide adaptador de driver y config aparte, se evalúa más adelante) |
| 24/10/2026 | Etapa 0: `railway.json` define build, start y pre-deploy (`npx prisma migrate deploy`), así no se cargan a mano en el panel. `npm start` corre `scripts/iniciar.mjs`, que fuerza `HOSTNAME=0.0.0.0` para el servidor standalone. `lib/db.ts` se adelantó a esta etapa para que la página de inicio verifique la conexión a la base |
| 24/10/2026 | Railway: proyecto `sistema-veterinarias` con servicios `app` y `Postgres`. Los primeros builds fallaron porque `public/` quedó vacía y Git no la sube; `scripts/copiar-standalone.mjs` ahora la copia solo si existe |
| 24/10/2026 | Pendientes: el límite de gasto de Railway es por workspace (afecta a todas las apps), lo decide Hussain. `railway.json` deja de funcionar el 01/12/2026: migrar a `.railway/railway.ts` antes. `npm audit` marca deepmerge-ts (dependencia de la CLI de Prisma 6, solo en build); se resuelve con Prisma 7 |
