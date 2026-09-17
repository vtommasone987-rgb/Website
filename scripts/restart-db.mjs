#!/usr/bin/env node
/**
 * Restarts the local development database after it wedges.
 *
 * Run with:  node scripts/restart-db.mjs
 *
 * The bundled `prisma dev` server stops accepting connections after a while — it
 * keeps its ports open but resets every connection, which surfaces in the app as
 * "Something went wrong" on any page that reads data. Restarting fixes it, and no
 * data is lost.
 *
 * Doing it by hand has a catch: `prisma dev stop` returns before it has actually
 * released its lock file, so starting again immediately fails with "Lock file is
 * already being held". This waits for the lock to clear instead of guessing.
 */

import { spawn } from "node:child_process";
import { Client } from "pg";
import { readFileSync } from "node:fs";

const SERVER_NAME = "opts";
const MAX_START_ATTEMPTS = 6;
const WAIT_BETWEEN_ATTEMPTS_MS = 6000;

/**
 * `shell: true` is needed on Windows to find `npx`, but passing a separate args
 * array alongside it triggers a deprecation warning, since Node can't escape
 * them. Joining into one string is the supported form. Safe here because every
 * argument is a hardcoded constant in this file — nothing comes from input.
 */
function run(command, args) {
  return new Promise((resolve) => {
    const child = spawn([command, ...args].join(" "), { shell: true });
    let output = "";
    child.stdout.on("data", (d) => (output += d));
    child.stderr.on("data", (d) => (output += d));
    child.on("close", (code) => resolve({ code, output }));
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Reads DATABASE_URL straight from .env so this doesn't depend on load order. */
function databaseUrl() {
  try {
    const env = readFileSync(".env", "utf8");
    const match = env.match(/^DATABASE_URL\s*=\s*"?([^"\n\r]+)"?/m);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

async function canConnect(url) {
  const client = new Client({ connectionString: url, connectionTimeoutMillis: 4000 });
  try {
    await client.connect();
    await client.query("select 1");
    await client.end();
    return true;
  } catch {
    try {
      await client.end();
    } catch {
      // Already broken; nothing to close.
    }
    return false;
  }
}

async function main() {
  const url = databaseUrl();
  if (!url) {
    console.error("Couldn't read DATABASE_URL from .env. Run this from the project folder.");
    process.exit(1);
  }

  process.stdout.write("Checking the database... ");
  if (await canConnect(url)) {
    console.log("it's already working. Nothing to do.");
    console.log("\nIf a page still shows an error, restart the dev server instead.");
    return;
  }
  console.log("not responding. Restarting it.\n");

  process.stdout.write("Stopping the old server... ");
  await run("npx", ["prisma", "dev", "stop", SERVER_NAME]);
  console.log("done");

  // The stop command returns before the lock file is released, so retry rather
  // than sleeping once and hoping.
  for (let attempt = 1; attempt <= MAX_START_ATTEMPTS; attempt++) {
    process.stdout.write(`Starting it again (try ${attempt} of ${MAX_START_ATTEMPTS})... `);
    const { output } = await run("npx", ["prisma", "dev", "-d", "-n", SERVER_NAME]);

    if (/Lock file is already being held/i.test(output)) {
      console.log("still shutting down, waiting");
      await sleep(WAIT_BETWEEN_ATTEMPTS_MS);
      continue;
    }

    await sleep(3000);
    if (await canConnect(url)) {
      console.log("done");
      console.log("\nThe database is back. Reload the page in your browser.");
      console.log("You do NOT need to restart the dev server or sign in again.");
      return;
    }

    console.log("not up yet, waiting");
    await sleep(WAIT_BETWEEN_ATTEMPTS_MS);
  }

  console.error("\nCouldn't bring it back automatically.");
  console.error("Close any other terminal running the database, then try again.");
  process.exit(1);
}

main().catch((error) => {
  console.error("Something went wrong:", error.message);
  process.exit(1);
});
