/**
 * Copia PNG desde `assets/teams-eps/` → `public/teams/` con los nombres que usa el seed/API.
 * Renombres:
 *   guadalajara.png → chivas.png
 *   cruzazul.png (o cruz_azul.png) → cruz-azul.png
 *   atleticosl.png → atletico-san-luis.png
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..", "..");
const SRC = path.join(ROOT, "assets", "teams-eps");
const DST = path.join(__dirname, "..", "public", "teams");

/** Archivo en SRC → nombre en public/teams (solo entradas que cambian). */
const RENAME = {
  "guadalajara.png": "chivas.png",
  "cruzazul.png": "cruz-azul.png",
  "cruz_azul.png": "cruz-azul.png",
  "atleticosl.png": "atletico-san-luis.png",
};

function main() {
  if (!fs.existsSync(SRC)) {
    console.warn(`No existe ${SRC}; nada que sincronizar.`);
    process.exit(0);
  }
  fs.mkdirSync(DST, { recursive: true });
  let n = 0;
  for (const file of fs.readdirSync(SRC)) {
    if (!file.endsWith(".png")) continue;
    const out = RENAME[file] ?? file;
    fs.copyFileSync(path.join(SRC, file), path.join(DST, out));
    console.info(`${file} → public/teams/${out}`);
    n++;
  }
  console.info(`Listo: ${n} PNG sincronizados. En API: npm run db:seed (actualiza logoUrl en BD).`);
}

main();
