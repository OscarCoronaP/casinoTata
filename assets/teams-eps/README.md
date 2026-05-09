# Escudos Liga MX (PNG)

Coloca aquí los archivos **PNG** (idealmente con fondo transparente).

## Sincronizar a la web

Desde `apps/web`:

```bash
npm run teams:sync-pngs
```

Copia a `apps/web/public/teams/` con estos renombres automáticos:

- `guadalajara.png` → `chivas.png`
- `cruzazul.png` o `cruz_azul.png` → `cruz-azul.png`
- `atleticosl.png` → `atletico-san-luis.png`

El resto se copia con el mismo nombre (`america.png`, `pachuca.png`, etc.).

Luego, si quieres actualizar URLs en la base de datos: `cd apps/api && npm run db:seed`.
