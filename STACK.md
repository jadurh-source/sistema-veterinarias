# Stack tecnológico — Sistema web para veterinarias

Documento de referencia para mostrar y justificar las decisiones técnicas del proyecto.
Última revisión: 24/10/2026.

## Resumen

| Capa | Tecnología | Por qué |
|---|---|---|
| Framework | **Next.js 16** (App Router) con **React 19** | Un solo proyecto para el sitio público y el panel. Renderiza del lado del servidor, lo que mejora el posicionamiento en Google de la landing. |
| Lenguaje | **TypeScript** (modo estricto) | Detecta errores antes de ejecutar. Claude Code trabaja mejor con tipos explícitos. |
| Estilos | **Tailwind CSS** | Permite cambiar colores y estilo por veterinaria con variables, sin reescribir CSS. |
| Base de datos | **PostgreSQL** (servicio administrado de Railway) | Base robusta, con respaldos, y que no depende del disco del servidor. |
| Acceso a datos | **Prisma ORM** | Define el modelo de datos en un archivo, genera migraciones y tipos automáticamente. |
| Autenticación | **Better Auth** (email + contraseña) | Login del panel con roles (dueño, recepción). Corre dentro del mismo proyecto, sin servicio externo pago. |
| Validación | **Zod** | Valida todos los formularios en el servidor (reservas, cobros, altas). |
| Fechas | **date-fns** + **@date-fns/tz** | Manejo correcto de la zona horaria argentina (el servidor corre en UTC). |
| Tests | **Vitest** | Pruebas unitarias de la lógica crítica (disponibilidad, cobros). Mismo runner que en otros proyectos. |
| Hosting | **Railway** | Un servicio para la app + un servicio PostgreSQL, en un solo proyecto. |
| Control de versiones | **Git + GitHub** | Railway despliega automáticamente cada vez que se sube a la rama `main`. |

## Arquitectura

```
Navegador ──► Next.js en Railway (un solo servicio)
                ├─ /[slug]            Sitio público de cada veterinaria (landing + reserva)
                ├─ /panel/...         Panel de gestión (requiere login)
                └─ Server Actions     Lógica de negocio: turnos, cobros, clientes
                        │
                        ▼
              PostgreSQL en Railway (una base para todas las veterinarias,
              cada registro marcado con su veterinaria)
```

## Decisiones clave y su motivo

1. **PostgreSQL, no SQLite.** En Railway el disco del contenedor se borra en cada despliegue. Una base dentro de un archivo local perdería los datos. PostgreSQL vive en su propio servicio con respaldos.
2. **Nada se guarda en el disco del servidor.** Por la misma razón: logos o imágenes futuras irán a un almacenamiento externo (bucket), nunca a una carpeta del proyecto.
3. **Una sola aplicación para todas las veterinarias (multi-veterinaria).** Cada dato lleva el identificador de su veterinaria. Sumar un cliente nuevo es cargar una fila de configuración, no clonar el proyecto ni pagar otro servidor.
4. **Salida `standalone` de Next.js.** Es el modo que Railway recomienda para alojar Next.js: genera un servidor Node liviano.
5. **Migraciones automáticas al desplegar.** `npm start` ejecuta `npx prisma migrate deploy` antes de levantar el servidor: si una migración falla, la nueva versión no arranca. (El pre-deploy de Railway vía `railway.json` quedó deprecado y no se aplicaba.)
6. **Zona horaria explícita.** Los turnos se guardan con fecha y hora absolutas y se muestran en `America/Argentina/Tucuman`. Evita el error clásico de turnos corridos 3 horas.
7. **Sin pagos online en la v1.** Los cobros se registran en el panel (efectivo, transferencia, Mercado Pago, débito, crédito). La integración de cobro online queda para una etapa posterior.

## Configuración en Railway

- Proyecto con dos servicios: **app** (desde el repositorio de GitHub) y **PostgreSQL** (+ New → Database → PostgreSQL).
- Variables de la app: `DATABASE_URL` (referencia al servicio PostgreSQL), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `TZ_APP=America/Argentina/Tucuman`.
- Migraciones: las aplica `npm start` al arrancar (no hace falta comando previo al despliegue).
- Dominio: Settings → Networking → Generate Domain (luego se puede asociar un dominio propio).

## Control de costos en Railway

Railway factura por consumo. Para no tener sorpresas:

- **Límite duro (hard limit):** se configura en Usage Limits. Al alcanzarlo, Railway apaga los servicios en lugar de seguir facturando. El mínimo es USD 10.
- **Alerta por email:** se configura un monto menor al límite duro para recibir aviso antes.
- Railway avisa por email al 75 %, 90 % y 100 % del límite.
- Si se alcanza el límite, alcanza con subirlo para que Railway vuelva a levantar los servicios.
- Un solo servicio de app compartido por todas las veterinarias mantiene el consumo bajo.

Riesgo a tener presente: con el límite duro alcanzado, el sitio queda fuera de línea hasta subirlo. Conviene fijarlo con margen y mirar el consumo mensual.

## Versiones

Al crear el proyecto se fija la última versión estable de Next.js 16 disponible (16.4.x a octubre de 2026) y se aplican las actualizaciones de seguridad que Next.js publica periódicamente.
