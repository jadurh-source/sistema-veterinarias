# CLAUDE.md — Sistema web para veterinarias

## Qué es este proyecto

Sistema web con dos caras para veterinarias:

1. **Sitio público** de cada veterinaria: presenta sus servicios y precios y permite reservar turnos online.
2. **Panel de gestión** para el dueño y la recepción: agenda de turnos, clientes y mascotas, servicios y precios, caja y reportes.

Se construye primero una versión general y después se adapta a cada veterinaria por configuración (nombre, colores, servicios, horarios, profesionales), sin tocar el código.

## Antes de trabajar, leé

- `STACK.md` — stack y decisiones técnicas (no cambiar sin consultar).
- `docs/01-vision.md` — producto y alcance de la v1.
- `docs/02-modulos.md` — qué hace cada pantalla.
- `docs/03-modelo-datos.md` — entidades y campos.
- `docs/04-reglas-negocio.md` — reglas de turnos, horarios, cobros y vacunas.
- `docs/05-plan-etapas.md` — en qué etapa estamos y qué sigue.

## Stack

Next.js 16 (App Router) · TypeScript estricto · Tailwind CSS · PostgreSQL · Prisma · Better Auth · Zod · date-fns. Hosting en Railway. Detalle en `STACK.md`.

## Estructura de carpetas

```
src/
  app/
    [slug]/               Sitio público de cada veterinaria
      page.tsx            Landing
      reservar/           Flujo de reserva
    panel/                Panel (protegido por login)
      agenda/
      clientes/
      servicios/
      caja/
      configuracion/
    api/auth/             Rutas de Better Auth
  lib/
    db.ts                 Cliente Prisma único
    auth.ts               Configuración de Better Auth
    tenant.ts             Obtener la veterinaria actual (por slug o por sesión)
    disponibilidad.ts     Cálculo de horarios libres
    fechas.ts             Helpers de zona horaria
    dinero.ts             Formato de pesos
  server/                 Server actions por módulo (turnos.ts, cobros.ts, clientes.ts…)
  components/
    publico/
    panel/
    ui/
prisma/
  schema.prisma
  seed.ts                 Veterinaria de demostración con datos de ejemplo
docs/
```

## Comandos

```
npm run dev                      # desarrollo local
npx prisma migrate dev           # crear y aplicar migración en local
npx prisma db seed               # cargar datos de demo
npm run build && npm start       # probar build de producción
```

Base local: `npx prisma dev --name veterinarias --detach` (Postgres local de Prisma, sin Docker). Su URL TCP (`postgres://...`) va en `DATABASE_URL` del `.env` con `connection_limit=1&pgbouncer=true` (ver `.env.example`). Si aparece "prepared statement already exists", reiniciarla con `npx prisma dev stop veterinarias` y volver a levantarla. Admite una sola conexión: la concurrencia real (doble reserva) se prueba contra la base de Railway.

## Reglas obligatorias

**Multi-veterinaria**
- Toda tabla de negocio tiene `veterinariaId`. Toda consulta filtra por la veterinaria actual, obtenida con `lib/tenant.ts`. Nunca se confía en un `veterinariaId` que venga del navegador.

**Datos y hosting (Railway)**
- Nunca usar SQLite ni guardar archivos en el disco del servidor: se borra en cada despliegue.
- Toda modificación del modelo pasa por `prisma migrate dev` y queda versionada en `prisma/migrations`.
- Variables sensibles solo en `.env` (local) y en Variables de Railway. `.env` no se sube a Git; mantener `.env.example` al día.
- `next.config.ts` con `output: "standalone"`.

**Fechas y dinero**
- Fechas de turnos en la base como `timestamptz` (UTC). Se convierten a `America/Argentina/Tucuman` solo para mostrar o para interpretar lo que carga el usuario, con los helpers de `lib/fechas.ts`.
- Montos con `Decimal` en Prisma, nunca `float`. Se muestran como `$ 18.000` (formato es-AR).

**Código**
- Nombres del dominio en español, igual que en `docs/03-modelo-datos.md` (Turno, Mascota, Cliente, Pago…).
- Toda acción del servidor valida su entrada con Zod y verifica el rol del usuario.
- Server Components por defecto; `"use client"` solo donde hay interacción.
- Textos de la interfaz en español rioplatense con voseo ("Reservá tu turno", "Elegí el horario").

**Forma de trabajo**
- Trabajar una etapa de `docs/05-plan-etapas.md` por vez. Al terminarla, marcar sus casillas y anotar desvíos o decisiones nuevas en el doc correspondiente.
- Si una regla de negocio no está definida en `docs/04-reglas-negocio.md`, preguntar antes de inventarla.
- No agregar dependencias fuera de `STACK.md` sin consultar.
- Commits chicos y descriptivos, en español.
