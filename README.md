# Sistema web para veterinarias

Sitio público con reserva de turnos + panel de gestión. Contexto en `CLAUDE.md`, stack en `STACK.md`, producto y plan en `docs/`.

## Desarrollo local

Requisitos: Node 24. No hace falta Docker: `prisma dev` levanta un Postgres local.

```bash
npm install
cp .env.example .env          # completar las variables
npx prisma dev --name veterinarias --detach   # base local; la URL TCP va en DATABASE_URL
npx prisma migrate deploy     # aplica las migraciones
npx prisma db seed            # carga la veterinaria de demo
npm run dev                   # http://localhost:3000
```

## Otros comandos

```bash
npm test                      # tests (Vitest)
npm run lint
npm run build && npm start    # build de producción (standalone), como en Railway
```

## Railway

- Build: `npm run build` · Start: `npm start` · Pre-deploy: `npx prisma migrate deploy`.
- Variables: ver `.env.example`.
