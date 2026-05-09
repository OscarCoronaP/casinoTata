# Deploy gratis (stack recomendado)

Combinación que suele encajar en **tier gratuito**: Postgres en **Neon**, API en **Render** (plan gratuito con “sleep”), frontend en **Vercel** (Hobby).

**Limitaciones típicas:** la API en Render puede **apagarse** tras unos minutos sin tráfico y el **primer request** tarda ~30–60 s en despertar. Para demo o pocos usuarios suele bastar.

---

## 1. Postgres gratis — Neon

1. Entra en [https://neon.tech](https://neon.tech) y crea un proyecto.
2. Copia la **connection string** PostgreSQL (`DATABASE_URL`).
3. En el SQL editor de Neon no hace falta crear tablas a mano; las crea Prisma con las migraciones.

---

## 2. API gratis — Render

1. Cuenta en [https://render.com](https://render.com) y conecta tu repo de GitHub.
2. **New → Web Service**, eligiendo el mismo repositorio.
3. Configuración sugerida:

| Campo | Valor |
|--------|--------|
| **Root Directory** | `apps/api` |
| **Runtime** | Node |
| **Build Command** | `npm install && npx prisma generate && npm run build` |
| **Start Command** | `npx prisma migrate deploy && npm start` |

   - Si prefieres **no** ejecutar migraciones en cada arranque: usa solo `npm start` como Start y ejecuta migraciones una vez (paso 5).

4. **Environment** (Variables):

| Variable | Ejemplo / notas |
|----------|------------------|
| `DATABASE_URL` | La de Neon |
| `JWT_SECRET` | Cadena larga aleatoria (32+ caracteres) |
| `NODE_ENV` | `production` |
| `PORT` | Render inyecta `PORT`; tu código ya usa `env.PORT` por defecto 4000 |
| `WEB_ORIGIN` | La URL final del front (paso 4), ej. `https://tu-app.vercel.app` |
| `ADMIN_BOOTSTRAP_PHONE` | Tu `+52…` **antes** de registrarte como admin |

5. **Primera vez — migraciones y seed** (una vez el servicio ya exista):

   - En Render: **Shell** del servicio (o tu máquina con `DATABASE_URL` de prod):

   ```bash
   cd apps/api
   npx prisma migrate deploy
   npm run db:seed
   ```

6. Anota la URL pública del servicio, ej. `https://quiniela-api-xxxx.onrender.com`.

---

## 3. Frontend gratis — Vercel

1. Cuenta en [https://vercel.com](https://vercel.com) → **Add New → Project** → importa el repo.
2. **Root Directory**: `apps/web`
3. Framework: Next.js (auto).
4. Variable de entorno:

| Variable | Valor |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://quiniela-api-xxxx.onrender.com` (sin `/` al final) |

5. Deploy. Copia la URL del proyecto, ej. `https://quiniela.vercel.app`.

---

## 4. Cierre del círculo (CORS)

1. Vuelve a **Render** → variables del Web Service y pon:

   `WEB_ORIGIN=https://tu-proyecto.vercel.app`

   (Si usas también `www`, puedes poner ambas separadas por coma, igual que en local.)

2. **Redeploy** el servicio en Render para que tome el cambio.

---

## 5. Probar en producción

1. Abre el front en Vercel → **Registro** con el mismo teléfono que `ADMIN_BOOTSTRAP_PHONE`.
2. Entra a `/admin` → crea jornada y partidos.
3. Predicciones y ranking deberían hablar con la API usando `NEXT_PUBLIC_API_URL`.

---

## Alternativas gratis (resumen)

| Pieza | Otras opciones gratuitas / baratas |
|-------|-------------------------------------|
| Postgres | **Supabase** (free tier), **Turso** no aplica (SQLite; haría falta cambiar Prisma). |
| API Node | **Fly.io** (créditos/límite), **Koyeb** (free con límites). Express en **Vercel** solo con adaptación serverless (no está hecho en este repo). |
| Front | **Netlify** con root `apps/web`, misma env `NEXT_PUBLIC_API_URL`. |

Si quieres **sin cold starts**, casi siempre hace falta plan de pago en el host del API o un **always-on** gratuito muy limitado.
