# Quiniela Liga MX

Aplicación web tipo mini-quiniela para **Liga MX**: predicciones con puntos, sin dinero real. Frontend Next.js + backend Express + PostgreSQL + Prisma + JWT (registro/login por teléfono único, nickname opcional único) + API-Football.

## Requisitos

- Node.js 20+
- Docker (opcional, sólo PostgreSQL)
- Cuenta [API-Football](https://www.api-football.com/) para datos deportivos en producción

## Arranque rápido

### 1. Base de datos

```powershell
docker compose up -d
```

Cadena sugerida (puerto **5433** en host; ver `docker-compose.yml`):

`postgresql://postgres:postgres@127.0.0.1:5433/quiniela_ligamx?schema=public`

Si en Windows tienes **otra variable de entorno `DATABASE_URL`** (usuario/sistema) apuntando al `:5432`, puede pisar el `.env` al ejecutar Prisma CLI. Borra esa variable del sistema o iguala el puerto a **5433**. El servidor Node ya carga `.env` con prioridad (`override: true` en `apps/api/src/config/env.ts`).

### 2. API (`apps/api`)

```powershell
cd apps/api
copy .env.example .env   # edita valores
npm install
npx prisma migrate dev --name init   # o: npx prisma db push
npm run dev
```

**Auth:** no hay SMS: registro con `phone` + `name` (+ `nickname` opcional); login sólo con `phone`. Sin verificación del número, cualquiera que conozca el teléfono puede iniciar sesión.

Primer admin: define `ADMIN_BOOTSTRAP_PHONE` con el mismo E.164 que usarás en registro.

Cron integrado (opcional):

```env
ENABLE_CRON=true
API_FOOTBALL_KEY=tu_clave
```

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
| api | `npm run job:sync` | Sincroniza fixtures/tablas |
| api | `npm run job:score` | Bloquea + califica |
| web | `npm run build` | Build producción |

## Documentación

Ver [ARCHITECTURE.md](./ARCHITECTURE.md) para diagramas lógicos, modelo ER conceptual y estrategia de despliegue.

## Notas legales de producto

No se gestionan pagos ni premios monetarios: es un juego de habilidad deportiva con puntos virtuales.
