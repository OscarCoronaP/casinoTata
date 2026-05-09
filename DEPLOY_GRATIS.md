# Deploy gratis (stack recomendado)

Combinación que suele encajar en **tier gratuito**: Postgres en **Neon**, API en **Render** (plan gratuito con “sleep”), frontend en **Vercel** (Hobby).

**Limitaciones típicas:** la API en Render puede **apagarse** tras unos minutos sin tráfico y el **primer request** tarda ~30–60 s en despertar. Para demo o pocos usuarios suele bastar.

---

## 1. Postgres gratis — Neon

1. Entra en [https://neon.tech](https://neon.tech) y crea un proyecto.
2. Copia la **connection string** PostgreSQL (`DATABASE_URL`) desde el panel de Neon (formato `postgresql://…`).

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

   - Render suele instalar con `NODE_ENV=production`, así que **no instala `devDependencies`**. Por eso `typescript`, `prisma` y `@types/*` están en **`dependencies`** en `apps/api`; si no, `tsc` falla en el build. Alternativa en otros proyectos: `npm install --include=dev && …`.
   - Si prefieres **no** ejecutar migraciones en cada arranque: usa solo `npm start` como Start y ejecuta migraciones una vez (paso 5).

4. **Environment** (Variables):

| Variable | Qué poner |
|----------|------------|
| `DATABASE_URL` | La connection string de Neon |
| `JWT_SECRET` | Cadena larga aleatoria (32+ caracteres) |
| `NODE_ENV` | `production` |
| `PORT` | **No la configures a mano.** Render define solo la variable `PORT` en tiempo de ejecución y Express ya la usa. En local sigues usando `4000` por defecto; en Render será otro puerto interno y está bien. |
| `WEB_ORIGIN` | La URL **del front en Vercel**, tal como la abres en el navegador: `https://TU-PROYECTO.vercel.app` (con `https`, sin barra al final). Sirve para **CORS**: solo ese origen puede llamar a tu API con cookies/credenciales. Si aún no tienes la URL del paso 3, puedes dejarla provisional y corregirla en el paso 4. |

**`DEFAULT_USER_PASSWORD`** (recomendado): contraseña inicial para usuarios creados desde admin y compatibilidad con cuentas sin hash; mínimo 8 caracteres (igual que en `.env.example` de la API).
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
