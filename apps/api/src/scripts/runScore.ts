import {
  lockPredictionsForStartedMatches,
  scoreFinishedMatches,
} from "../services/scoring.service.js";

async function main() {
  const locked = await lockPredictionsForStartedMatches();
  const scored = await scoreFinishedMatches();
  console.info({ locked, scored });
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
