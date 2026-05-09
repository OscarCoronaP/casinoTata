# Quiniela Liga MX

Aplicación tipo mini-quiniela para **Liga MX**: predicciones con puntos, sin dinero real. Stack: **Next.js** + **Express** + **PostgreSQL** + **Prisma** + **JWT**. Calendario y resultados son **100 % manuales** vía panel administrador (sin API-Football ni cron de datos externos).

## Requisitos

- Node.js 20+
- Docker (opcional, sólo PostgreSQL)

## Arranque rápido

### 1. Base de datos

```powershell
docker compose up -d
```

Cadena sugerida (puerto **5433** en host; ver `docker-compose.yml`):

`postgresql://postgres:postgres@127.0.0.1:5433/quiniela_ligamx?schema=public`

Si en Windows tienes **otra variable de entorno `DATABASE_URL`** (usuario/sistema) apuntando al `:5432`, puede pisar el `.env` al ejecutar Prisma CLI. Borra esa variable del sistema o iguala el puerto a **5433**. El servidor Node carga `.env` con prioridad (`override: true` en `apps/api/src/config/env.ts`).

### 2. API (`apps/api`)

```powershell
cd apps/api
copy .env.example .env   # edita valores
npm install
```

Migraciones (BD ya existente sin historial Prisma: ejecuta el SQL de `prisma/migrations/20260208120000_manual_admin_quiniela/migration.sql` o usa `npx prisma migrate deploy`, y marca aplicada si hace falta con `npx prisma migrate resolve --applied 20260208120000_manual_admin_quiniela`):

```powershell
npx prisma migrate deploy
npx prisma generate
npm run db:seed
npm run dev
```

**Auth:** registro con `phone` + `name` (+ `nickname` opcional); login sólo con `phone`.

**Admin:** define `ADMIN_BOOTSTRAP_PHONE` en `.env` con el mismo E.164 que usarás al registrarte; reinicia la API. Desde `/admin` creas **jornadas**, **partidos** y **marcadores finales**; el servidor recalcula puntos (+3 exacto, +1 ganador/empate).

### 3. Web (`apps/web`)

```powershell
cd apps/web
copy .env.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000`. La API por defecto apunta a `http://localhost:4000`.

## Scripts útiles

| Ubicación | Comando | Descripción |
|-----------|---------|-------------|
| api | `npm run db:seed` | Carga / actualiza equipos Liga MX en BD |
| api | `npm run job:score` | Bloquea pronósticos por horario + reconcilia puntos y leaderboard |
| web | `npm run build` | Build producción |

## Documentación

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) (puede estar desactualizada respecto al modelo manual reciente).

## Notas legales de producto

No se gestionan pagos ni premios monetarios: es un juego de habilidad deportiva con puntos virtuales.
