import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * `logoUrl`: rutas públicas servidas por Next (`apps/web/public/teams/{slug}.png`).
 * Los slugs coinciden exactamente con los nombres de archivo PNG disponibles.
 */
const TEAMS: Array<{
  name: string;
  shortName: string;
  slug: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string | null;
}> = [
  // ── Grupo A ──────────────────────────────────────────────────────────────
  {
    name: "México",
    shortName: "MEX",
    slug: "mexico",
    primaryColor: "#006847",
    secondaryColor: "#CE1126",
    logoUrl: "/teams/mexico.png",
  },
  {
    name: "Corea del Sur",
    shortName: "KOR",
    slug: "coreadelsur",
    primaryColor: "#CD2E3A",
    secondaryColor: "#0047A0",
    logoUrl: "/teams/coreadelsur.png",
  },
  {
    name: "República Checa",
    shortName: "CZE",
    slug: "republicacheca",
    primaryColor: "#D7141A",
    secondaryColor: "#11457E",
    logoUrl: "/teams/republicacheca.png",
  },
  {
    name: "Sudáfrica",
    shortName: "RSA",
    slug: "sudafrica",
    primaryColor: "#007A4D",
    secondaryColor: "#FFB612",
    logoUrl: "/teams/sudafrica.png",
  },

  // ── Grupo B ──────────────────────────────────────────────────────────────
  {
    name: "Canadá",
    shortName: "CAN",
    slug: "canada",
    primaryColor: "#FF0000",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/canada.png",
  },
  {
    name: "Qatar",
    shortName: "QAT",
    slug: "qatar",
    primaryColor: "#8D1B3D",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/qatar.png",
  },
  {
    name: "Suiza",
    shortName: "SUI",
    slug: "suiza",
    primaryColor: "#FF0000",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/suiza.png",
  },
  {
    name: "Bosnia y Herzegovina",
    shortName: "BIH",
    slug: "bosnia",
    primaryColor: "#002395",
    secondaryColor: "#FFCD00",
    logoUrl: "/teams/bosnia.png",
  },

  // ── Grupo C ──────────────────────────────────────────────────────────────
  {
    name: "Brasil",
    shortName: "BRA",
    slug: "brasil",
    primaryColor: "#009C3B",
    secondaryColor: "#FFDF00",
    logoUrl: "/teams/brasil.png",
  },
  {
    name: "Marruecos",
    shortName: "MAR",
    slug: "marruecos",
    primaryColor: "#C1272D",
    secondaryColor: "#006233",
    logoUrl: "/teams/marruecos.png",
  },
  {
    name: "Haití",
    shortName: "HAI",
    slug: "haiti",
    primaryColor: "#00209F",
    secondaryColor: "#D21034",
    logoUrl: "/teams/haiti.png",
  },
  {
    name: "Escocia",
    shortName: "SCO",
    slug: "escocia",
    primaryColor: "#003F87",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/escocia.png",
  },

  // ── Grupo D ──────────────────────────────────────────────────────────────
  {
    name: "Estados Unidos",
    shortName: "USA",
    slug: "estadosunidos",
    primaryColor: "#002868",
    secondaryColor: "#BF0A30",
    logoUrl: "/teams/estadosunidos.png",
  },
  {
    name: "Paraguay",
    shortName: "PAR",
    slug: "paraguay",
    primaryColor: "#D52B1E",
    secondaryColor: "#0038A8",
    logoUrl: "/teams/paraguay.png",
  },
  {
    name: "Australia",
    shortName: "AUS",
    slug: "australia",
    primaryColor: "#00843D",
    secondaryColor: "#FFD700",
    logoUrl: "/teams/australia.png",
  },
  {
    name: "Turquía",
    shortName: "TUR",
    slug: "turquia",
    primaryColor: "#E30A17",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/turquia.png",
  },

  // ── Grupo E ──────────────────────────────────────────────────────────────
  {
    name: "Alemania",
    shortName: "GER",
    slug: "alemania",
    primaryColor: "#000000",
    secondaryColor: "#DD0000",
    logoUrl: "/teams/alemania.png",
  },
  {
    name: "Costa de Marfil",
    shortName: "CIV",
    slug: "costa_de_marfil",
    primaryColor: "#F77F00",
    secondaryColor: "#009A44",
    logoUrl: "/teams/costa_de_marfil.png",
  },
  {
    name: "Ecuador",
    shortName: "ECU",
    slug: "ecuador",
    primaryColor: "#FFD100",
    secondaryColor: "#0033A0",
    logoUrl: "/teams/ecuador.png",
  },
  {
    name: "Curazao",
    shortName: "CUW",
    slug: "curazao",
    primaryColor: "#002B7F",
    secondaryColor: "#F9E000",
    logoUrl: "/teams/curazao.png",
  },

  // ── Grupo F ──────────────────────────────────────────────────────────────
  {
    name: "Países Bajos",
    shortName: "NED",
    slug: "paisesbajos",
    primaryColor: "#FF4F00",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/paisesbajos.png",
  },
  {
    name: "Japón",
    shortName: "JPN",
    slug: "japon",
    primaryColor: "#003DA5",
    secondaryColor: "#BC002D",
    logoUrl: "/teams/japon.png",
  },
  {
    name: "Suecia",
    shortName: "SWE",
    slug: "suecia",
    primaryColor: "#006AA7",
    secondaryColor: "#FECC00",
    logoUrl: "/teams/suecia.png",
  },
  {
    name: "Túnez",
    shortName: "TUN",
    slug: "tunez",
    primaryColor: "#E70013",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/tunez.png",
  },

  // ── Grupo G ──────────────────────────────────────────────────────────────
  {
    name: "Bélgica",
    shortName: "BEL",
    slug: "belgica",
    primaryColor: "#000000",
    secondaryColor: "#EF3340",
    logoUrl: "/teams/belgica.png",
  },
  {
    name: "Irán",
    shortName: "IRN",
    slug: "iran",
    primaryColor: "#239F40",
    secondaryColor: "#DA0000",
    logoUrl: "/teams/iran.png",
  },
  {
    name: "Nueva Zelanda",
    shortName: "NZL",
    slug: "nuevazelanda",
    primaryColor: "#000000",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/nuevazelanda.png",
  },
  {
    name: "Egipto",
    shortName: "EGY",
    slug: "egipto",
    primaryColor: "#CE1126",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/egipto.png",
  },

  // ── Grupo H ──────────────────────────────────────────────────────────────
  {
    name: "España",
    shortName: "ESP",
    slug: "espana",
    primaryColor: "#AA151B",
    secondaryColor: "#F1BF00",
    logoUrl: "/teams/espana.png",
  },
  {
    name: "Arabia Saudita",
    shortName: "KSA",
    slug: "arabiasaudita",
    primaryColor: "#006C35",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/arabiasaudita.png",
  },
  {
    name: "Uruguay",
    shortName: "URU",
    slug: "uruguay",
    primaryColor: "#75AADB",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/uruguay.png",
  },
  {
    name: "Cabo Verde",
    shortName: "CPV",
    slug: "cabo_verde",
    primaryColor: "#003893",
    secondaryColor: "#CF2027",
    logoUrl: "/teams/cabo_verde.png",
  },

  // ── Grupo I ──────────────────────────────────────────────────────────────
  {
    name: "Francia",
    shortName: "FRA",
    slug: "francia",
    primaryColor: "#002395",
    secondaryColor: "#ED2939",
    logoUrl: "/teams/francia.png",
  },
  {
    name: "Senegal",
    shortName: "SEN",
    slug: "senegal",
    primaryColor: "#00853F",
    secondaryColor: "#FDEF42",
    logoUrl: "/teams/senegal.png",
  },
  {
    name: "Irak",
    shortName: "IRQ",
    slug: "irak",
    primaryColor: "#CE1126",
    secondaryColor: "#007A3D",
    logoUrl: "/teams/irak.png",
  },
  {
    name: "Noruega",
    shortName: "NOR",
    slug: "noruega",
    primaryColor: "#EF2B2D",
    secondaryColor: "#002868",
    logoUrl: "/teams/noruega.png",
  },

  // ── Grupo J ──────────────────────────────────────────────────────────────
  {
    name: "Argentina",
    shortName: "ARG",
    slug: "argentina",
    primaryColor: "#74ACDF",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/argentina.png",
  },
  {
    name: "Argelia",
    shortName: "ALG",
    slug: "argelia",
    primaryColor: "#006233",
    secondaryColor: "#D21034",
    logoUrl: "/teams/argelia.png",
  },
  {
    name: "Austria",
    shortName: "AUT",
    slug: "austria",
    primaryColor: "#ED2939",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/austria.png",
  },
  {
    name: "Jordania",
    shortName: "JOR",
    slug: "jordania",
    primaryColor: "#007A3D",
    secondaryColor: "#CE1126",
    logoUrl: "/teams/jordania.png",
  },

  // ── Grupo K ──────────────────────────────────────────────────────────────
  {
    name: "Portugal",
    shortName: "POR",
    slug: "portugal",
    primaryColor: "#006600",
    secondaryColor: "#FF0000",
    logoUrl: "/teams/portugal.png",
  },
  {
    name: "Colombia",
    shortName: "COL",
    slug: "colombia",
    primaryColor: "#FCD116",
    secondaryColor: "#003087",
    logoUrl: "/teams/colombia.png",
  },
  {
    name: "Uzbekistán",
    shortName: "UZB",
    slug: "uzbekistan",
    primaryColor: "#1EB53A",
    secondaryColor: "#0099B5",
    logoUrl: "/teams/uzbekistan.png",
  },
  {
    name: "RD del Congo",
    shortName: "COD",
    slug: "congo",
    primaryColor: "#007FFF",
    secondaryColor: "#CE1126",
    logoUrl: "/teams/congo.png",
  },

  // ── Grupo L ──────────────────────────────────────────────────────────────
  {
    name: "Inglaterra",
    shortName: "ENG",
    slug: "inglaterra",
    primaryColor: "#FFFFFF",
    secondaryColor: "#CF081F",
    logoUrl: "/teams/inglaterra.png",
  },
  {
    name: "Croacia",
    shortName: "CRO",
    slug: "croacia",
    primaryColor: "#FF0000",
    secondaryColor: "#FFFFFF",
    logoUrl: "/teams/croacia.png",
  },
  {
    name: "Ghana",
    shortName: "GHA",
    slug: "ghana",
    primaryColor: "#006B3F",
    secondaryColor: "#FCD116",
    logoUrl: "/teams/ghana.png",
  },
  {
    name: "Panamá",
    shortName: "PAN",
    slug: "panama",
    primaryColor: "#DA121A",
    secondaryColor: "#0033A0",
    logoUrl: "/teams/panama.png",
  },
];

async function main() {
  for (const t of TEAMS) {
    await prisma.team.upsert({
      where: { slug: t.slug },
      create: t,
      update: {
        name:           t.name,
        shortName:      t.shortName,
        primaryColor:   t.primaryColor,
        secondaryColor: t.secondaryColor,
        logoUrl:        t.logoUrl,
      },
    });
  }
  console.info(`Seed: ${TEAMS.length} selecciones Mundial 2026 ✅`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
