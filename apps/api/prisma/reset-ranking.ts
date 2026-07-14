import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const stats = await prisma.userStats.updateMany({
    data: {
      totalPoints: 0,
      exactMatches: 0,
      winnerHits: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  });

  const predictions = await prisma.prediction.updateMany({
    data: {
      pointsEarned: null,
      scoredAt: null,
    },
  });

  console.info(
    `Ranking reiniciado: ${stats.count} usuarios, ${predictions.count} predicciones limpiadas.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    void prisma.$disconnect();
    process.exit(1);
  });
