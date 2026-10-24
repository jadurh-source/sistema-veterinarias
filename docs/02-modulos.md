# 02 — Módulos y pantallas

## A. Sitio público (`/[slug]`)

Pensado para celular primero: la mayoría de los clientes llega desde Instagram o WhatsApp.

### A1. Landing
- Encabezado: logo, nombre, botón fijo "Reservar turno".
- Portada: eslogan, propuesta breve y **el próximo horario libre** ("Próximo turno disponible: hoy 17:30").
- Servicios agrupados por categoría (Clínica, Prevención, Estética, Cirugía, Diagnóstico) con duración y precio. Solo los marcados "visible en la web".
- Cómo reservar: tres pasos.
- Horarios de atención (incluye horario cortado, ej. 9 a 13 y 17 a 21), dirección, WhatsApp y mapa como enlace externo.
- Pie con datos de contacto.

### A2. Reserva online
1. Elegir servicio.
2. Elegir día (próximos 30 días) y horario libre.
3. Datos: nombre y apellido, WhatsApp, nombre de la mascota, especie (perro, gato, otro), comentario opcional.
4. Confirmación: "Recibimos tu solicitud. Te confirmamos por WhatsApp."

Sin cuenta ni contraseña. El turno se crea en estado **Pendiente**.

## B. Panel (`/panel`, requiere login)

Navegación: Agenda · Clientes · Servicios · Caja · Configuración. La agenda muestra un contador de reservas pendientes de confirmar.

### B1. Agenda (Dueño y Recepción)
- Vista **día** (por defecto: hoy) dividida en mañana y tarde, y vista **semana**.
- Cada turno muestra: hora, mascota y especie, servicio, cliente, profesional, estado, origen (web, mostrador, WhatsApp, teléfono).
- Resumen del día: cantidad de turnos, pendientes de confirmar, monto cobrado.
- Acciones según estado (ver `04-reglas-negocio.md`): Confirmar, Cobrar, Marcar ausente, Cancelar, Reprogramar.
- Botón WhatsApp: abre el chat con el cliente con el mensaje de confirmación armado.
- Botón "Nuevo turno": cliente existente o nuevo, mascota, servicio, día, horario libre, profesional, origen.
- Filtro por profesional.

### B2. Clientes y mascotas (Dueño y Recepción)
- Lista con buscador por nombre, teléfono o nombre de mascota.
- Ficha del cliente: datos de contacto, mascotas, historial de turnos y total gastado.
- Ficha de la mascota: especie, raza, sexo, edad calculada, peso, notas, historial de servicios, **estado de vacunas** (al día, vence pronto, vencida).
- Alta y edición de clientes y mascotas. Botón "Nuevo turno" desde la ficha.

### B3. Servicios y precios (solo Dueño)
- Tabla con nombre, categoría, especie, duración, precio, visible en la web, activo.
- Edición en línea de precio y duración.
- Aumento masivo de precios por porcentaje (por categoría o todos), con vista previa antes de aplicar.
- Los cambios se ven al instante en el sitio público. Los turnos ya reservados mantienen su precio.

### B4. Caja y reportes (solo Dueño)
- Períodos: hoy, últimos 7 días, últimos 30 días, este mes, rango personalizado.
- Indicadores: ingresos, turnos atendidos, ticket promedio, ausentismo.
- Ingresos por día (gráfico de barras), por medio de pago, por servicio y por profesional.
- Lista de cobros con fecha, cliente, servicio, medio y monto.
- Turnos atendidos sin cobrar.
- Exportar a CSV.

### B5. Configuración (solo Dueño)
- Datos de la veterinaria: nombre, eslogan, logo, color principal, dirección, WhatsApp, email.
- Horarios de atención por día y franja.
- Profesionales: alta, baja, qué categorías de servicio atienden, horarios propios.
- Días bloqueados (feriados, vacaciones).
- Usuarios del panel y sus roles.
