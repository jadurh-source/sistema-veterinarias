# 03 — Modelo de datos

Base PostgreSQL vía Prisma. Todas las tablas de negocio tienen `veterinariaId`, `creadoEn` y `actualizadoEn`. Los identificadores son `cuid()`.

## Entidades

### Veterinaria
| Campo | Tipo | Nota |
|---|---|---|
| id | String | |
| slug | String único | Usado en la URL pública (`/huellitas`) |
| nombre | String | |
| eslogan | String? | |
| colorPrimario | String | Hex, ej. `#1f6b5a` |
| logoUrl | String? | Almacenamiento externo, nunca disco local |
| direccion | String? | |
| whatsapp | String | Formato internacional `+549...` |
| email | String? | |
| zonaHoraria | String | Por defecto `America/Argentina/Tucuman` |
| diasReservaMax | Int | Por defecto 30 |
| activa | Boolean | |

### Usuario (lo gestiona Better Auth, con campos agregados)
| Campo | Tipo | Nota |
|---|---|---|
| veterinariaId | String | |
| nombre | String | |
| email | String único | |
| rol | Enum `DUENO`, `RECEPCION` | |
| emailVerificado, imagen | Boolean, String? | Los pide Better Auth |

### Profesional
| Campo | Tipo | Nota |
|---|---|---|
| nombre | String | |
| tipo | Enum `VETERINARIO`, `PELUQUERO` | |
| categorias | Enum[] de `CategoriaServicio` | Qué servicios puede atender |
| activo | Boolean | |

### HorarioAtencion
Una fila por franja. Si `profesionalId` es nulo, es el horario general de la veterinaria.
| Campo | Tipo | Nota |
|---|---|---|
| profesionalId | String? | |
| diaSemana | Int 0–6 | 0 = domingo |
| desde | String `HH:mm` | Hora local |
| hasta | String `HH:mm` | |

### Bloqueo
| Campo | Tipo | Nota |
|---|---|---|
| profesionalId | String? | Nulo = cierra toda la veterinaria |
| inicio / fin | DateTime (timestamptz) | |
| motivo | String | "Feriado", "Vacaciones"… |

### Servicio
| Campo | Tipo | Nota |
|---|---|---|
| nombre | String | |
| categoria | Enum `CLINICA`, `PREVENCION`, `ESTETICA`, `CIRUGIA`, `DIAGNOSTICO` | |
| descripcion | String? | |
| especie | Enum `PERRO`, `GATO`, `TODAS` | |
| duracionMin | Int | |
| precio | Decimal(12,2) | |
| visibleWeb | Boolean | |
| activo | Boolean | |
| revacunacionDias | Int? | Solo vacunas. Ej. 365 |
| orden | Int | Orden en la landing |

### Cliente
| Campo | Tipo | Nota |
|---|---|---|
| nombre | String | Nombre y apellido |
| telefono | String | Normalizado `+549...`. Único por veterinaria |
| email | String? | |
| notas | String? | |

### Mascota
| Campo | Tipo | Nota |
|---|---|---|
| clienteId | String | |
| nombre | String | |
| especie | Enum `PERRO`, `GATO`, `OTRO` | |
| raza | String? | |
| sexo | Enum `MACHO`, `HEMBRA`, `SIN_DATO` | |
| fechaNacimiento | Date? | La edad se calcula |
| pesoKg | Decimal(5,2)? | |
| notas | String? | Alergias, carácter, etc. |

### Turno
| Campo | Tipo | Nota |
|---|---|---|
| inicio / fin | DateTime (timestamptz) | `fin = inicio + duracionMin` |
| servicioId | String | |
| profesionalId | String | |
| clienteId | String | |
| mascotaId | String | |
| estado | Enum `PENDIENTE`, `CONFIRMADO`, `ATENDIDO`, `AUSENTE`, `CANCELADO` | |
| origen | Enum `WEB`, `MOSTRADOR`, `WHATSAPP`, `TELEFONO` | |
| precioAcordado | Decimal(12,2) | Copia del precio al reservar |
| comentarioCliente | String? | Lo que escribió en la reserva web |
| notasInternas | String? | |
| creadoPorId | String? | Nulo si vino de la web |

Índices: `(veterinariaId, inicio)`, `(profesionalId, inicio)`.

### Pago
| Campo | Tipo | Nota |
|---|---|---|
| turnoId | String? | Nulo para un cobro suelto |
| clienteId | String? | |
| monto | Decimal(12,2) | |
| medio | Enum `EFECTIVO`, `TRANSFERENCIA`, `MERCADO_PAGO`, `DEBITO`, `CREDITO` | |
| fecha | DateTime | |
| registradoPorId | String | |
| nota | String? | |
| anulaPagoId | String? único | Solo en el pago inverso: apunta al pago que anula. Monto negativo |

### AplicacionVacuna
Se crea al cobrar o marcar atendido un turno cuyo servicio tiene `revacunacionDias`. Lleva `veterinariaId` como toda tabla de negocio.
| Campo | Tipo | Nota |
|---|---|---|
| mascotaId | String | |
| servicioId | String | |
| turnoId | String? | Nulo si se carga una vacuna previa |
| fecha | Date | |
| vence | Date | `fecha + revacunacionDias` |

## Relaciones

```
Veterinaria 1─N Usuario, Profesional, Servicio, Cliente, HorarioAtencion, Bloqueo, Turno, Pago
Cliente     1─N Mascota
Turno       N─1 Servicio, Profesional, Cliente, Mascota
Turno       1─N Pago          (normalmente uno; admite pago en partes)
Mascota     1─N AplicacionVacuna
```

## Datos de demostración (`prisma/seed.ts`)

Veterinaria "Huellitas" (slug `huellitas`) con:
- 2 veterinarios y 1 peluquera.
- Horario lunes a viernes 9–13 y 17–21, sábado 9–13.
- 12 servicios de ejemplo (consulta, vacunas antirrábica, séxtuple y triple felina, desparasitación, baño y corte chico y grande, castraciones, ecografía, análisis, consulta a domicilio).
- 15 clientes con 1 o 2 mascotas cada uno.
- Turnos de las últimas 4 semanas (la mayoría atendidos y cobrados) y de la próxima semana (confirmados y pendientes), relativos a la fecha en que se corre el seed.
- Usuarios: `dueno@demo.com` y `recepcion@demo.com`, contraseña en `.env`.
