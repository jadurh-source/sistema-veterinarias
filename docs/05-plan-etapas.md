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
- [x] Límite de gasto y alerta configurados en Railway (alerta por email a USD 10, sin límite duro: es por workspace y cortaría todas las apps)
- [x] Página "Hola" visible en el dominio de Railway (https://app-production-3c13.up.railway.app)

> Leé CLAUDE.md y STACK.md. Hacé la Etapa 0 de docs/05-plan-etapas.md: creá el proyecto Next.js con el stack definido, dejá Prisma conectado a un PostgreSQL local con `npx prisma dev` y prepará todo para desplegar en Railway. Al final dame la lista exacta de pasos que tengo que hacer yo en GitHub y en el panel de Railway.

## Etapa 1 — Modelo de datos y datos de demo
- [x] `schema.prisma` completo según docs/03-modelo-datos.md
- [x] Primera migración
- [x] `seed.ts` con la veterinaria "Huellitas" y datos relativos a la fecha actual
- [x] `lib/db.ts`, `lib/fechas.ts`, `lib/dinero.ts` (con tests)

> Hacé la Etapa 1. Traducí docs/03-modelo-datos.md a schema.prisma, creá la migración y el seed de demo. Antes de escribir el seed mostrame el schema para revisarlo.

## Etapa 2 — Login, roles y estructura del panel
- [x] Better Auth con email y contraseña
- [x] Rol y `veterinariaId` en la sesión
- [x] `lib/tenant.ts`
- [x] Protección de `/panel` y de cada server action por rol (`lib/acciones.ts`, con tests)
- [x] Layout del panel con navegación (Agenda, Clientes, Servicios, Caja, Configuración)

> Hacé la Etapa 2: login con Better Auth, roles DUENO y RECEPCION según docs/04-reglas-negocio.md sección 8, y el layout del panel con navegación vacía por ahora.

## Etapa 3 — Configuración y servicios
- [ ] Pantalla Configuración: datos de la veterinaria, horarios, profesionales, bloqueos
- [ ] Pantalla Servicios con edición en línea y aumento masivo por porcentaje

> Hacé la Etapa 3: pantallas de Configuración y Servicios del panel según docs/02-modulos.md (B3 y B5).

## Etapa 4 — Sitio público
- [x] `/[slug]` con landing completa desde la base
- [x] Color y datos de cada veterinaria aplicados
- [x] 404 amable si el slug no existe o la veterinaria está inactiva
- [x] Metadatos para compartir en WhatsApp e Instagram

> Hacé la Etapa 4: la landing pública en /[slug] según docs/02-modulos.md A1. Pensada para celular primero.

## Etapa 5 — Disponibilidad y reserva online
- [x] `lib/disponibilidad.ts` con pruebas unitarias de los casos de docs/04 sección 1
- [x] Flujo de reserva en 4 pasos
- [x] Verificación contra doble reserva
- [x] "Próximo turno disponible" en la portada

> Hacé la Etapa 5. Primero escribí lib/disponibilidad.ts con sus tests cubriendo todas las reglas de docs/04-reglas-negocio.md secciones 1, 2 y 7; recién después el flujo de reserva de docs/02 A2.

## Etapa 6 — Agenda
- [x] Vista día y semana, filtro por profesional
- [x] Acciones por estado según docs/04 sección 3 (Cobrar queda para la Etapa 8)
- [x] Nuevo turno y reprogramar
- [x] Botón WhatsApp con mensaje armado
- [x] Contador de pendientes en la navegación

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
| 24/10/2026 | Pendientes: `npm audit` marca deepmerge-ts (dependencia de la CLI de Prisma 6, solo en build); se resuelve con Prisma 7 |
| 24/10/2026 | Railway: alerta de gasto por email a USD 10 y sin límite duro (el límite es por workspace y apagaría también Miel del Alba y Nutri Mica) |
| 24/10/2026 | Anulación de pagos: el pago no se borra; se registra otro pago con monto negativo y `anulaPagoId` apuntando al original (único: no se anula dos veces). Quién y cuándo salen de `registradoPorId` y `fecha` del pago inverso |
| 24/10/2026 | Etapa 1: `AplicacionVacuna` también lleva `veterinariaId` (regla de CLAUDE.md). `Usuario` suma `emailVerificado` e `imagen`, que pide Better Auth. Los usuarios de demo se crean sin contraseña: la contraseña (`DEMO_PASSWORD`) se carga en la Etapa 2, con las tablas de Better Auth. El seed se corre con Node directo (sin tsx), por eso importa `../src/lib/fechas.ts` con extensión |
| 24/10/2026 | Base local: la URL lleva `pgbouncer=true`; sin eso `prisma dev` falla con "prepared statement already exists" desde la segunda conexión. Si igual aparece, reiniciar: `npx prisma dev stop veterinarias` y `npx prisma dev --name veterinarias --detach` |
| 24/10/2026 | Etapa 2: el login está en `/ingresar` y se hace desde el navegador contra `/api/auth` (no con server action) para que aplique el límite de intentos de Better Auth (3 cada 10 s). Sin registro público: los usuarios los crea el seed o el alta. Tablas `Sesion`, `Cuenta` y `Verificacion` con campos en español mapeados en `lib/auth.ts`. Las server actions usan `accionProtegida` de `lib/acciones.ts` (sesión + rol + Zod) |
| 24/10/2026 | Slugs reservados para veterinarias: `panel`, `ingresar`, `api` (son rutas del sistema). Tenerlo en cuenta en la Etapa 9 |
| 24/10/2026 | Migraciones con la base local: `npm run migracion -- nombre` (`scripts/nueva-migracion.mjs`), porque `prisma migrate dev` falla con la base sombra de `prisma dev` |
| 24/10/2026 | Railway ignoraba `railway.json` (formato deprecado): el pre-deploy nunca corrió y producción quedó sin tablas. Se borró `railway.json` y las migraciones pasan a correr en `npm start` (`prisma migrate deploy && node scripts/iniciar.mjs`) |
| 24/10/2026 | Etapa 4: diseño tomado de las referencias de `Veterinaria Puro Pelo/` (estructura de "Veterinaria Alfa" + estilo del Instagram de Puro Pelo: fondo suave, ola, títulos Barlow Condensed). Un solo color por veterinaria (`colorPrimario`); los tonos suave y oscuro se derivan con `color-mix`. Fotos genéricas de Unsplash (licencia libre, uso comercial) en `public/fotos/` hasta tener fotos propias. La landing se cachea por slug (`lib/landing.ts`, etiqueta `landing-<slug>`): la Etapa 3 tiene que invalidarla al guardar cambios |
| 24/10/2026 | Etapa 4: el 404 de un slug inexistente se muestra bien pero responde con código 200 (la página llega en streaming). `/[slug]/reservar` es provisoria y deriva a WhatsApp hasta la Etapa 5. "Próximo turno disponible" en la portada queda para la Etapa 5 |
| 24/10/2026 | Segunda demo: "Puro Pelo" en `/puropelo` (color, nombre y doctoras Fer, Agus y Ayu de su Instagram; dirección, WhatsApp y precios de ejemplo). Usuarios `dueno@puropelo.demo` y `recepcion@puropelo.demo` con `DEMO_PASSWORD` |
| 25/10/2026 | Etapa 5: el flujo de reserva vive en la URL (`?especie=&servicio=&dia=&inicio=`), cada paso lo arma el servidor. La acción `reservarTurno` (`src/server/reservas.ts`) es la única sin login: valida con Zod, saca la veterinaria del slug y vuelve a calcular la disponibilidad dentro de una transacción con `pg_advisory_xact_lock` por veterinaria. Probado de punta a punta con dos personas reservando el mismo horario |
| 25/10/2026 | Etapa 5: especie OTRO solo ve servicios TODAS (agregado a docs/04). WhatsApp se guarda como +549 + 10 dígitos; se acepta con 0, 15 o +54 9. Campo trampa oculto contra robots en el formulario. "Próximo turno disponible" = primer horario de una consulta clínica (o del primer servicio visible) en los próximos 7 días |
| 25/10/2026 | Etapa 6: reprogramar conserva el estado (un pendiente sigue pendiente). Marcar atendido un turno de vacuna crea la `AplicacionVacuna` con su vencimiento. Desde el panel se puede dar turno en cualquier horario: si el profesional está fuera de horario, ocupado o bloqueado, se muestra la advertencia y se pide "Cargar igual". El panel ofrece también los servicios ocultos en la web. Mañana y tarde se separan a las 14 hs |
| 25/10/2026 | Etapa 6: dentro de una transacción todas las consultas usan su cliente (`tx`); con una sola conexión (base local) usar `db` traba la transacción. Las transacciones tienen 15 s de tiempo máximo |
| 24/10/2026 | `npm run crear-usuario` (`scripts/crear-usuario.ts`): crea un usuario del panel o le cambia la contraseña; la contraseña va en la variable CONTRASENA. Cada usuario pertenece a una sola veterinaria: para entrar a varias se usa un email por veterinaria (ej. jadurh+puropelo@gmail.com) |
| 25/10/2026 | Fotos por servicio en la landing: campo `Servicio.fotoUrl` (migración `foto_servicio`); fotos genéricas de Unsplash en `public/fotos/servicios/`, con foto por categoría si falta. El seed conserva los usuarios agregados a mano (con su contraseña) al regenerar las demos |
