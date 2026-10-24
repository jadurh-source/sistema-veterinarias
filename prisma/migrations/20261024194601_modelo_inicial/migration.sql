-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DUENO', 'RECEPCION');

-- CreateEnum
CREATE TYPE "TipoProfesional" AS ENUM ('VETERINARIO', 'PELUQUERO');

-- CreateEnum
CREATE TYPE "CategoriaServicio" AS ENUM ('CLINICA', 'PREVENCION', 'ESTETICA', 'CIRUGIA', 'DIAGNOSTICO');

-- CreateEnum
CREATE TYPE "EspecieServicio" AS ENUM ('PERRO', 'GATO', 'TODAS');

-- CreateEnum
CREATE TYPE "Especie" AS ENUM ('PERRO', 'GATO', 'OTRO');

-- CreateEnum
CREATE TYPE "Sexo" AS ENUM ('MACHO', 'HEMBRA', 'SIN_DATO');

-- CreateEnum
CREATE TYPE "EstadoTurno" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'ATENDIDO', 'AUSENTE', 'CANCELADO');

-- CreateEnum
CREATE TYPE "OrigenTurno" AS ENUM ('WEB', 'MOSTRADOR', 'WHATSAPP', 'TELEFONO');

-- CreateEnum
CREATE TYPE "MedioPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'MERCADO_PAGO', 'DEBITO', 'CREDITO');

-- CreateTable
CREATE TABLE "Veterinaria" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "eslogan" TEXT,
    "colorPrimario" TEXT NOT NULL DEFAULT '#1f6b5a',
    "logoUrl" TEXT,
    "direccion" TEXT,
    "whatsapp" TEXT NOT NULL,
    "email" TEXT,
    "zonaHoraria" TEXT NOT NULL DEFAULT 'America/Argentina/Tucuman',
    "diasReservaMax" INTEGER NOT NULL DEFAULT 30,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Veterinaria_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerificado" BOOLEAN NOT NULL DEFAULT false,
    "imagen" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'RECEPCION',
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profesional" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" "TipoProfesional" NOT NULL,
    "categorias" "CategoriaServicio"[],
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Profesional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HorarioAtencion" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "profesionalId" TEXT,
    "diaSemana" INTEGER NOT NULL,
    "desde" TEXT NOT NULL,
    "hasta" TEXT NOT NULL,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "HorarioAtencion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bloqueo" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "profesionalId" TEXT,
    "inicio" TIMESTAMPTZ(3) NOT NULL,
    "fin" TIMESTAMPTZ(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Bloqueo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" "CategoriaServicio" NOT NULL,
    "descripcion" TEXT,
    "especie" "EspecieServicio" NOT NULL DEFAULT 'TODAS',
    "duracionMin" INTEGER NOT NULL,
    "precio" DECIMAL(12,2) NOT NULL,
    "visibleWeb" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "revacunacionDias" INTEGER,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT,
    "notas" TEXT,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mascota" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "especie" "Especie" NOT NULL,
    "raza" TEXT,
    "sexo" "Sexo" NOT NULL DEFAULT 'SIN_DATO',
    "fechaNacimiento" DATE,
    "pesoKg" DECIMAL(5,2),
    "notas" TEXT,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Mascota_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Turno" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "inicio" TIMESTAMPTZ(3) NOT NULL,
    "fin" TIMESTAMPTZ(3) NOT NULL,
    "servicioId" TEXT NOT NULL,
    "profesionalId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "mascotaId" TEXT NOT NULL,
    "estado" "EstadoTurno" NOT NULL DEFAULT 'PENDIENTE',
    "origen" "OrigenTurno" NOT NULL,
    "precioAcordado" DECIMAL(12,2) NOT NULL,
    "comentarioCliente" TEXT,
    "notasInternas" TEXT,
    "creadoPorId" TEXT,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Turno_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "turnoId" TEXT,
    "clienteId" TEXT,
    "monto" DECIMAL(12,2) NOT NULL,
    "medio" "MedioPago" NOT NULL,
    "fecha" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradoPorId" TEXT NOT NULL,
    "nota" TEXT,
    "anulaPagoId" TEXT,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AplicacionVacuna" (
    "id" TEXT NOT NULL,
    "veterinariaId" TEXT NOT NULL,
    "mascotaId" TEXT NOT NULL,
    "servicioId" TEXT NOT NULL,
    "turnoId" TEXT,
    "fecha" DATE NOT NULL,
    "vence" DATE NOT NULL,
    "creadoEn" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "actualizadoEn" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "AplicacionVacuna_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Veterinaria_slug_key" ON "Veterinaria"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_veterinariaId_idx" ON "Usuario"("veterinariaId");

-- CreateIndex
CREATE INDEX "Profesional_veterinariaId_idx" ON "Profesional"("veterinariaId");

-- CreateIndex
CREATE INDEX "HorarioAtencion_veterinariaId_diaSemana_idx" ON "HorarioAtencion"("veterinariaId", "diaSemana");

-- CreateIndex
CREATE INDEX "HorarioAtencion_profesionalId_idx" ON "HorarioAtencion"("profesionalId");

-- CreateIndex
CREATE INDEX "Bloqueo_veterinariaId_inicio_idx" ON "Bloqueo"("veterinariaId", "inicio");

-- CreateIndex
CREATE INDEX "Bloqueo_profesionalId_inicio_idx" ON "Bloqueo"("profesionalId", "inicio");

-- CreateIndex
CREATE INDEX "Servicio_veterinariaId_orden_idx" ON "Servicio"("veterinariaId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "Cliente_veterinariaId_telefono_key" ON "Cliente"("veterinariaId", "telefono");

-- CreateIndex
CREATE INDEX "Mascota_veterinariaId_idx" ON "Mascota"("veterinariaId");

-- CreateIndex
CREATE INDEX "Mascota_clienteId_idx" ON "Mascota"("clienteId");

-- CreateIndex
CREATE INDEX "Turno_veterinariaId_inicio_idx" ON "Turno"("veterinariaId", "inicio");

-- CreateIndex
CREATE INDEX "Turno_profesionalId_inicio_idx" ON "Turno"("profesionalId", "inicio");

-- CreateIndex
CREATE INDEX "Turno_clienteId_idx" ON "Turno"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "Pago_anulaPagoId_key" ON "Pago"("anulaPagoId");

-- CreateIndex
CREATE INDEX "Pago_veterinariaId_fecha_idx" ON "Pago"("veterinariaId", "fecha");

-- CreateIndex
CREATE INDEX "Pago_turnoId_idx" ON "Pago"("turnoId");

-- CreateIndex
CREATE INDEX "AplicacionVacuna_mascotaId_idx" ON "AplicacionVacuna"("mascotaId");

-- CreateIndex
CREATE INDEX "AplicacionVacuna_veterinariaId_vence_idx" ON "AplicacionVacuna"("veterinariaId", "vence");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Profesional" ADD CONSTRAINT "Profesional_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioAtencion" ADD CONSTRAINT "HorarioAtencion_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HorarioAtencion" ADD CONSTRAINT "HorarioAtencion_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloqueo" ADD CONSTRAINT "Bloqueo_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bloqueo" ADD CONSTRAINT "Bloqueo_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cliente" ADD CONSTRAINT "Cliente_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mascota" ADD CONSTRAINT "Mascota_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_profesionalId_fkey" FOREIGN KEY ("profesionalId") REFERENCES "Profesional"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Turno" ADD CONSTRAINT "Turno_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_registradoPorId_fkey" FOREIGN KEY ("registradoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_anulaPagoId_fkey" FOREIGN KEY ("anulaPagoId") REFERENCES "Pago"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionVacuna" ADD CONSTRAINT "AplicacionVacuna_veterinariaId_fkey" FOREIGN KEY ("veterinariaId") REFERENCES "Veterinaria"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionVacuna" ADD CONSTRAINT "AplicacionVacuna_mascotaId_fkey" FOREIGN KEY ("mascotaId") REFERENCES "Mascota"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionVacuna" ADD CONSTRAINT "AplicacionVacuna_servicioId_fkey" FOREIGN KEY ("servicioId") REFERENCES "Servicio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AplicacionVacuna" ADD CONSTRAINT "AplicacionVacuna_turnoId_fkey" FOREIGN KEY ("turnoId") REFERENCES "Turno"("id") ON DELETE SET NULL ON UPDATE CASCADE;
