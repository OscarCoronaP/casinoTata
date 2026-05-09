-- Quiniela manual: compatible con BD legacy (API-Football) y con PostgreSQL vacío (p. ej. Neon nuevo).

DO $$ BEGIN
  CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "MatchStatus" AS ENUM ('NS', 'LIVE', 'HT', 'FT', 'PST', 'CANC');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Legacy: ya existía Prediction con Match viejo (API-Football).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Prediction'
  ) THEN
    ALTER TABLE "Prediction" DROP CONSTRAINT IF EXISTS "Prediction_matchId_fkey";
    DELETE FROM "Prediction";
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'UserStats'
    ) THEN
      DELETE FROM "UserStats";
    END IF;
    DROP TABLE IF EXISTS "StandingRow";
    DROP TABLE IF EXISTS "Match";
  END IF;
END $$;

-- Fresh install: sin User (Neon recién creado). User sin passwordHash: lo añade la migración siguiente.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'User'
  ) THEN
    CREATE TABLE "User" (
      "id" TEXT NOT NULL,
      "phone" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "nickname" TEXT,
      "avatarUrl" TEXT,
      "role" "UserRole" NOT NULL DEFAULT 'USER',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "User_pkey" PRIMARY KEY ("id")
    );
    CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
    CREATE UNIQUE INDEX "User_nickname_key" ON "User"("nickname");

    CREATE TABLE "UserStats" (
      "userId" TEXT NOT NULL,
      "totalPoints" INTEGER NOT NULL DEFAULT 0,
      "exactMatches" INTEGER NOT NULL DEFAULT 0,
      "winnerHits" INTEGER NOT NULL DEFAULT 0,
      "currentStreak" INTEGER NOT NULL DEFAULT 0,
      "bestStreak" INTEGER NOT NULL DEFAULT 0,

      CONSTRAINT "UserStats_pkey" PRIMARY KEY ("userId")
    );

    ALTER TABLE "UserStats" ADD CONSTRAINT "UserStats_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL,
    "secondaryColor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Team_slug_key" ON "Team"("slug");

CREATE TABLE "Round" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Round_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "awayTeamId" TEXT NOT NULL,
    "kickoffUtc" TIMESTAMP(3) NOT NULL,
    "stadium" TEXT,
    "status" "MatchStatus" NOT NULL DEFAULT 'NS',
    "homeGoals" INTEGER,
    "awayGoals" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Match_roundId_idx" ON "Match"("roundId");
CREATE INDEX "Match_kickoffUtc_idx" ON "Match"("kickoffUtc");

ALTER TABLE "Match" ADD CONSTRAINT "Match_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_awayTeamId_fkey" FOREIGN KEY ("awayTeamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'Prediction'
  ) THEN
    CREATE TABLE "Prediction" (
      "id" TEXT NOT NULL,
      "userId" TEXT NOT NULL,
      "matchId" TEXT NOT NULL,
      "predHome" INTEGER NOT NULL,
      "predAway" INTEGER NOT NULL,
      "lockedAt" TIMESTAMP(3),
      "pointsEarned" INTEGER,
      "scoredAt" TIMESTAMP(3),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

      CONSTRAINT "Prediction_pkey" PRIMARY KEY ("id")
    );

    CREATE UNIQUE INDEX "Prediction_userId_matchId_key" ON "Prediction"("userId", "matchId");
    CREATE INDEX "Prediction_matchId_idx" ON "Prediction"("matchId");

    ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

ALTER TABLE "Prediction" DROP CONSTRAINT IF EXISTS "Prediction_matchId_fkey";
ALTER TABLE "Prediction" ADD CONSTRAINT "Prediction_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
