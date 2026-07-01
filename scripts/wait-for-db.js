// Used from Phase 2 (db:wait). Waits until Postgres accepts connections.

const { execSync } = require("node:child_process");

const maxAttempts = 30;
const delayMs = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForDatabase() {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync("docker exec artos-postgres pg_isready -U artos -d artos", {
        stdio: "ignore",
      });
      console.log("Postgres is ready.");
      return;
    } catch {
      console.log(`Waiting for Postgres (${attempt}/${maxAttempts})...`);
      await sleep(delayMs);
    }
  }

  throw new Error("Postgres did not become ready in time.");
}

waitForDatabase().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
