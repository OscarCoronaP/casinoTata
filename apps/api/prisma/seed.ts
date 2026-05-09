import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * `logoUrl`: rutas públicas servidas por Next (`apps/web/public/teams/{slug}.png`).
 * PNG en `assets/teams-eps/`: `cd apps/web && npm run teams:sync-pngs`
 * y `cd apps/api && npm run db:seed` para actualizar URLs en BD.
 */
const TEAMS: Array<{
  name: string;
  shortName: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}> = [
  {
    name: "Club América",
    shortName: "América",
    slug: "america",
    primaryColor: "#12284c",
    secondaryColor: "#c9a227",
    logoUrl: "/teams/america.png",
  },
  {
    name: "Guadalajara",
    shortName: "Chivas",
    slug: "chivas",
    primaryColor: "#d9232e",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/chivas.png",
  },
  {
    name: "Tigres UANL",
    shortName: "Tigres",
    slug: "tigres",
    primaryColor: "#005baa",
    secondaryColor: "#ffd200",
    logoUrl: "/teams/tigres.png",
  },
  {
    name: "Monterrey",
    shortName: "Rayados",
    slug: "monterrey",
    primaryColor: "#0b2647",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/monterrey.png",
  },
  {
    name: "Cruz Azul",
    shortName: "Cruz Azul",
    slug: "cruz-azul",
    primaryColor: "#00529e",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/cruz-azul.png",
  },
  {
    name: "Pumas UNAM",
    shortName: "Pumas",
    slug: "pumas",
    primaryColor: "#15396d",
    secondaryColor: "#d4af37",
    logoUrl: "/teams/pumas.png",
  },
  {
    name: "Toluca",
    shortName: "Toluca",
    slug: "toluca",
    primaryColor: "#b00820",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/toluca.png",
  },
  {
    name: "León",
    shortName: "León",
    slug: "leon",
    primaryColor: "#008043",
    secondaryColor: "#ffd200",
    logoUrl: "/teams/leon.png",
  },
  {
    name: "Pachuca",
    shortName: "Pachuca",
    slug: "pachuca",
    primaryColor: "#0046ad",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/pachuca.png",
  },
  {
    name: "Santos Laguna",
    shortName: "Santos",
    slug: "santos",
    primaryColor: "#00753e",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/santos.png",
  },
  {
    name: "Atlas",
    shortName: "Atlas",
    slug: "atlas",
    primaryColor: "#ac0000",
    secondaryColor: "#000000",
    logoUrl: "/teams/atlas.png",
  },
  {
    name: "Necaxa",
    shortName: "Necaxa",
    slug: "necaxa",
    primaryColor: "#e20613",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/necaxa.png",
  },
  {
    name: "Puebla",
    shortName: "Puebla",
    slug: "puebla",
    primaryColor: "#004aad",
    secondaryColor: "#ffffff",
    logoUrl: "/teams/puebla.png",
  },
  {
    name: "Mazatlán FC",
    shortName: "Mazatlán",
    slug: "mazatlan",
    primaryColor: "#4b0082",
    secondaryColor: "#00bfff",
    logoUrl: "/teams/mazatlan.png",
  },
  {
    name: "Querétaro",
    shortName: "Gallos",
    slug: "queretaro",
    primaryColor: "#005bbb",
    secondaryColor: "#000000",
    logoUrl: "/teams/queretaro.png",
  },
  {
    name: "Club Tijuana",
    shortName: "Xolos",
    slug: "tijuana",
    primaryColor: "#d1181f",
    secondaryColor: "#000000",
    logoUrl: "/teams/tijuana.png",
  },
  {
    name: "Atlético de San Luis",
    shortName: "Atl. San Luis",
    slug: "atletico-san-luis",
    primaryColor: "#d00412",
    secondaryColor: "#003f9e",
    logoUrl: "/teams/atletico-san-luis.png",
  },
  {
    name: "FC Juárez",
    shortName: "Juárez",
    slug: "juarez",
    primaryColor: "#007c59",
    secondaryColor: "#000000",
    logoUrl: "/teams/juarez.png",
  },
];

async function main() {
  for (const t of TEAMS) {
    await prisma.team.upsert({
      where: { slug: t.slug },
      create: t,
      update: {
        name: t.name,
        shortName: t.shortName,
        primaryColor: t.primaryColor,
        secondaryColor: t.secondaryColor,
        logoUrl: t.logoUrl,
      },
    });
  }
  console.info(`Seed: ${TEAMS.length} equipos Liga MX.`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
