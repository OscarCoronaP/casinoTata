# Arquitectura — Quiniela Liga MX

## Visión general

Monorepo con **frontend** (`apps/web`, Next.js 14 App Router + TypeScript + Tailwind + Framer Motion) y **backend** (`apps/api`, Node.js + Express + Prisma + PostgreSQL). Comunicación mediante **REST JSON** y autenticación **JWT** tras **registro o login** (teléfono único; nickname opcional único). No hay verificación SMS.

```
apps/web (Next.js)  ──HTTPS──►  CDN / Vercel
        │
        REST + JWT
        ▼
apps/api (Express)  ──►  PostgreSQL
        │
        └──► API-Football (fixtures, standings, logos)
```

## Estructura de carpetas

```
casinoTata/
├── apps/
│   ├── api/
│   │   ├── prisma/schema.prisma
│   │   └── src/
│   │       ├── index.ts              # Servidor HTTP + cron opcional
│   │       ├── config/env.ts
│   │       ├── lib/prisma.ts
│   │       ├── middleware/
│   │       ├── routes/
│   │       ├── services/
│   │       └── scripts/              # Jobs CLI (sync / score)
│   └── web/
│       └── src/
│           ├── app/                  # Rutas App Router
│           ├── components/
│           ├── context/
│           ├── lib/
│           └── types/
├── docker-compose.yml                # PostgreSQL local
└── ARCHITECTURE.md
```

## Modelo de datos (PostgreSQL / Prisma)

Entidades principales:

| Modelo | Rol |
|--------|-----|
| `User` | Usuario único por `phone`; `nickname` opcional y único cuando existe; rol `USER` \| `ADMIN`. |
| `UserStats` | Puntos totales, exactos, aciertos de resultado, rachas. |
| `Match` | Partido sincronizado de API-Football + momios ficticios + forma/ranking cache. |
| `Prediction` | Marcador pronosticado por usuario/partido; puntos asignados al cerrar. |
| `StandingRow` | Tabla general persistida por temporada/liga. |

Reglas de negocio:

- **Un teléfono = una cuenta** (`phone` único). **Nickname** único si se informa (varios usuarios pueden dejarlo vacío).
- Predicción editable sólo si `Match.status === NS` y `kickoffUtc > now` (refuerzo en API).
- **Job/cron**: bloqueo masivo con `lockPredictionsForStartedMatches` y **scoring** con `scoreFinishedMatches` (3 pts marcador exacto, 1 pt ganador/empate).

## Endpoints REST (API)

Prefijo: `/api/v1`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | `/auth/register` | No | Alta: `phone`, `name`, `nickname?`; valida unicidad; devuelve JWT. |
| POST | `/auth/login` | No | Entrada con `phone` si ya existe cuenta; devuelve JWT. |
| GET | `/matches` | No | Lista partidos; `?upcoming=true` filtra NS/LIVE/HT. |
| GET | `/matches/current-round` | No | Etiqueta heurística de jornada actual. |
| POST | `/predictions` | JWT | Upsert predicción. |
| GET | `/predictions/me` | JWT | Historial con `match` incluido. |
| GET | `/leaderboard/global` | No | Top puntos acumulados. |
| GET | `/leaderboard/by-round` | No | Top de la jornada (`?roundId=`); por defecto la jornada con la última predicción calificada. |
| GET | `/users/me` | JWT | Perfil + stats + posición global aproximada. |
| GET | `/live/matches` | No | Partidos `LIVE`/`HT` desde BD. |
| GET | `/standings` | No | Tabla persistida. |
| POST | `/admin/sync-football` | Admin | Sincroniza fixtures + standings. |
| POST | `/admin/lock-predictions` | Admin | Bloquea pronósticos vencidos. |
| POST | `/admin/score-matches` | Admin | Calcula puntos para FT. |
| GET | `/admin/stats` | Admin | Conteos rápidos. |

## Flujo registro / login → JWT

1. **Registro:** cliente envía `phone` (E.164), `name`, `nickname` opcional; API comprueba que `phone` y `nickname` (si viene) no existan; crea `User` + `UserStats`; JWT.
2. **Login:** cliente envía sólo `phone`; si existe usuario, JWT. No comprueba posesión del número (riesgo asumido en producto).

## Frontend — componentes clave

- `Providers` + `AuthProvider`: sesión en `localStorage`, perfil remoto.
- `Navbar`: navegación mobile-first + acceso admin si rol.
- `MatchCard` + `ScorePicker`: UX de pronóstico con animaciones Framer Motion.
- `AnimatedHero` / `StatCard`: landing premium oscura.
- Páginas: `/`, `/register`, `/predictions`, `/live`, `/standings`, `/ranking`, `/profile`, `/admin`.

## Jobs y escalabilidad

- **Cron embebido** (`ENABLE_CRON=true`): sync cada 10 min (si hay `API_FOOTBALL_KEY`), lock+score cada 2 min.
- En producción a escala: mover jobs a **workers** (BullMQ / Cloud Scheduler + colas) y cachear lecturas públicas (CDN / Redis).

## Deployment sugerido

| Pieza | Opción típica |
|-------|----------------|
| Web | Vercel / Cloudflare Pages (build Next). |
| API | Fly.io, Railway, Render, ECS/Fargate (Docker). |
| DB | RDS Postgres, Neon, Supabase. |
| Secrets | JWT_SECRET, API_Football en vault del proveedor. |
| Cron externo | GitHub Actions `schedule`, Cloud Scheduler llamando `POST /admin/*` con token admin rotado. |

Variables críticas: ver `apps/api/.env.example` y `apps/web/.env.example`.

## Mockups / línea visual

- **Paleta**: zinc 950 fondo, acento esmeralda/teal, vidrio (`glass-panel`).
- **Jerarquía**: hero ancho completo → KPIs en tarjetas → grillas 2 columnas en desktop.
- **Estados vacíos**: skeleton shimmer + copy orientativo a configurar API/sync.

## Próximos pasos recomendados

- Rate limiting (`express-rate-limit`) en `/auth/*`.
- auditoría de admin y rotación de JWT cortos + refresh tokens.
- Observabilidad: OpenTelemetry + logs estructurados.
- Tests e2e (Playwright) de registro/login y predicciones.
