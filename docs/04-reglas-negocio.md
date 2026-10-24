# 04 — Reglas de negocio

Si una situación no está cubierta acá, se consulta antes de implementarla.

## 1. Horarios y disponibilidad

- La veterinaria define franjas por día de semana (puede tener horario cortado: mañana y tarde).
- Cada profesional puede tener horario propio; si no tiene, usa el general.
- Los horarios se ofrecen en intervalos de **30 minutos** (configurable a futuro).
- Un horario está libre para un servicio si existe al menos un profesional que:
  1. atiende la categoría del servicio,
  2. trabaja en ese horario,
  3. no tiene otro turno que se superponga entre `inicio` y `inicio + duración` (no cuentan los cancelados),
  4. no tiene un bloqueo en ese rango.
- El turno debe terminar dentro de la franja. Un servicio de 90 minutos no se ofrece a las 12:00 si la franja cierra a las 13:00.
- En el sitio público no se ofrecen horarios pasados ni con menos de **2 horas** de anticipación, ni más allá de `diasReservaMax` días.
- Desde el panel se puede cargar un turno en cualquier horario, incluso superpuesto, mostrando una advertencia.
- **Doble reserva:** la creación del turno vuelve a verificar la disponibilidad dentro de una transacción. Si otro cliente tomó el horario, se informa "Ese horario se acaba de ocupar. Elegí otro." y se ofrecen los siguientes libres.

## 2. Asignación de profesional

- Reserva web: el sistema asigna el profesional libre con menos turnos ese día.
- Panel: se elige manualmente entre los profesionales disponibles; por defecto, el mismo criterio.

## 3. Estados del turno

```
PENDIENTE ──Confirmar──► CONFIRMADO ──Cobrar / Atendido──► ATENDIDO
    │                        │
    └──Cancelar──► CANCELADO ◄┘──Cancelar
                             └──Marcar ausente──► AUSENTE
```

| Estado | Significa | Acciones disponibles |
|---|---|---|
| PENDIENTE | Reservado desde la web, sin confirmar | Confirmar, Cancelar, Reprogramar, WhatsApp |
| CONFIRMADO | Confirmado con el cliente | Cobrar, Marcar atendido, Marcar ausente, Cancelar, Reprogramar |
| ATENDIDO | El servicio se prestó | Cobrar (si falta), ver pagos |
| AUSENTE | El cliente no vino | — |
| CANCELADO | Anulado, libera el horario | — |

- Los turnos creados desde el panel nacen **CONFIRMADOS**.
- Marcar ausente solo es posible una vez pasada la hora de inicio.
- Reprogramar cambia `inicio`, `fin` y profesional; conserva el turno y su precio.

## 4. Precios y cobros

- Al crear el turno se copia el precio del servicio en `precioAcordado`. Cambiar precios después no afecta turnos existentes.
- "Cobrar" propone `precioAcordado`; se puede modificar el monto (descuento, recargo) y se elige el medio de pago.
- Cobrar un turno CONFIRMADO lo pasa a ATENDIDO.
- Se admite pagar un turno en partes (más de un pago). El turno queda "Cobrado" cuando la suma de pagos alcanza `precioAcordado`.
- Medios de pago: Efectivo, Transferencia, Mercado Pago, Débito, Crédito.
- Un pago registrado no se borra: se anula con un movimiento inverso y queda la trazabilidad (quién y cuándo).
- Ingresos de los reportes = suma de pagos por fecha de pago, no por fecha del turno.

## 5. Clientes y mascotas

- En la reserva web el cliente se identifica por su **WhatsApp normalizado**. Si existe, se usa ese cliente; si no, se crea.
- La mascota se busca por nombre (sin distinguir mayúsculas ni acentos) dentro del cliente; si no existe, se crea.
- Recepción puede unir clientes duplicados (etapa posterior).
- Ausentismo de un período = (AUSENTE) / (ATENDIDO + AUSENTE).

## 6. Vacunas

- Los servicios de vacunación tienen `revacunacionDias` (antirrábica: 365).
- Al marcar ATENDIDO un turno de vacuna se registra una `AplicacionVacuna` con su vencimiento.
- Estado en la ficha de la mascota: **Al día**, **Vence pronto** (faltan 30 días o menos), **Vencida**.
- Se pueden cargar vacunas aplicadas antes de usar el sistema (desde la libreta sanitaria).

## 7. Especies

- Un servicio con especie PERRO no se ofrece para un gato, y viceversa. TODAS se ofrece a cualquiera.
- En la reserva web el cliente elige primero la especie, y solo ve servicios compatibles.

## 8. Permisos

| Acción | Dueño | Recepción |
|---|---|---|
| Agenda, turnos, cobrar | Sí | Sí |
| Clientes y mascotas | Sí | Sí |
| Anular un pago | Sí | No |
| Servicios y precios | Sí | Solo ver |
| Caja y reportes | Sí | Solo el resumen del día |
| Configuración y usuarios | Sí | No |
