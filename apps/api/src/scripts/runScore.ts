import {
  lockPredictionsForStartedMatches,
  reconcileScoresAndLeaderboard,
} from "../services/scoring.service.js";

async function main() {
  const locked = await lockPredictionsForStartedMatches();
  const scoring = await reconcileScoresAndLeaderboard();
  console.info({ locked, ...scoring });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
