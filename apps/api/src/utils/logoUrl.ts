/** Rutas en BD pueden quedar en `.svg` tras migrar escudos a PNG en `public/teams`. */
export function normalizeLogoUrl(url: string | null | undefined): string | null {
  if (url == null || url === "") return null;
  return url.replace(/\.svg$/i, ".png");
}
