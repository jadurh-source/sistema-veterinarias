# 01 — Visión del producto

## Problema

Muchas veterinarias chicas y medianas toman turnos por WhatsApp y teléfono, anotan en cuaderno o planilla y no saben con precisión cuánto facturan por servicio. No tienen un sitio propio donde mostrar servicios y precios.

## Propuesta

Un sistema web con dos caras conectadas:

- **Sitio público**: la vidriera de la veterinaria. Servicios, precios, horarios, ubicación y **reserva de turno online**.
- **Panel de gestión**: donde llegan esas reservas y donde el equipo administra agenda, clientes, mascotas, servicios y la caja.

Un turno que el cliente reserva en el sitio aparece en el acto en la agenda del panel como "Pendiente de confirmar".

## Modelo comercial y de adaptación

- Se construye **una versión general** que funciona para cualquier veterinaria.
- Cada veterinaria nueva se da de alta como una fila de configuración: nombre, logo, color, eslogan, dirección, WhatsApp, servicios, precios, profesionales y horarios.
- Su sitio queda en `dominio.com/[slug]` (ej. `/huellitas`). Más adelante, dominio propio.
- Las necesidades particulares de cada veterinaria se resuelven primero con configuración; solo si no alcanza, con desarrollo a medida.

## Usuarios

| Usuario | Qué hace |
|---|---|
| Cliente (dueño de la mascota) | Ve servicios y precios, reserva turno desde el celular. Sin cuenta ni contraseña. |
| Recepción | Confirma reservas, carga turnos de mostrador o WhatsApp, registra cobros, administra clientes y mascotas. |
| Dueño de la veterinaria | Todo lo anterior, más servicios y precios, configuración y reportes de caja. |

**Decisión por defecto (a validar):** v1 con dos roles, Dueño y Recepción. El rol Veterinario (cada profesional ve su agenda) queda para una etapa posterior.

## Alcance de la v1

Incluye:
- Landing pública configurable por veterinaria.
- Reserva online con disponibilidad real según horarios, duración del servicio y profesionales.
- Agenda por día y semana, con estados del turno.
- Clientes y mascotas con historial de visitas y vencimiento de vacunas.
- Servicios y precios editables, con opción de mostrarlos u ocultarlos en el sitio.
- Registro de cobros por medio de pago y reportes de caja.
- Login con roles.

No incluye en la v1:
- Pago online de la reserva.
- Recordatorios automáticos por WhatsApp o email (en la v1, botón para abrir WhatsApp con el mensaje armado).
- Historia clínica detallada (diagnósticos, recetas).
- Venta de productos (alimento, accesorios) y control de stock.
- Facturación electrónica ARCA.
- Dominio propio por veterinaria.

## Decisiones abiertas

- [ ] Confirmar roles de la v1 (Dueño + Recepción).
- [ ] Confirmar modelo multi-veterinaria en una sola aplicación (ver `STACK.md`).
- [ ] Nombre comercial del producto.
- [ ] Veterinaria piloto para validar.
