#!/usr/bin/env node
/**
 * Sets the owner admin password, stored scrambled (scrypt) instead of in plain text.
 *
 * Run with:  npm run set-password
 *
 * The password is typed with echo turned off, so it never appears on screen, never
 * lands in shell history, and is never passed as a command-line argument (which
 * would be visible to anyone listing running processes). Only the scrypt hash and
 * its salt are written to .env.local; the password itself is never stored anywhere.
 */

import { createInterface } from "node:readline";
import { randomBytes, scryptSync } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { resolve } from "node:path";

const ENV_PATH = resolve(process.cwd(), ".env.local");
const MIN_LENGTH = 12;

/**
 * Reads a line without echoing it.
 *
 * Raw mode is the only reliable way to stop the terminal printing keystrokes:
 * we take each character ourselves and simply never write it out. It needs a real
 * terminal, so when input is piped (tests, CI) this falls back to plain readline —
 * there's nothing to hide from in that case, because there's no screen to shoulder-surf.
 */
/**
 * Piped input is drained once up front and handed out line by line. Opening a
 * second readline over an already-closed stdin silently never resolves, which is
 * exactly the kind of bug that only shows up when someone scripts this.
 */
let pipedLines = null;
async function readPipedLines() {
  if (pipedLines) return pipedLines;
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  pipedLines = data.split(/\r?\n/);
  return pipedLines;
}

function askHidden(question) {
  const stdin = process.stdin;

  if (!stdin.isTTY) {
    return readPipedLines().then((lines) => (lines.length ? lines.shift().trim() : ""));
  }

  return new Promise((resolvePrompt) => {
    process.stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";
    const onData = (chunk) => {
      for (const char of chunk) {
        switch (char) {
          case "\r":
          case "\n":
          case "": // Ctrl-D
            stdin.setRawMode(false);
            stdin.pause();
            stdin.removeListener("data", onData);
            process.stdout.write("\n");
            resolvePrompt(value);
            return;
          case "": // Ctrl-C — leave the terminal usable on the way out.
            stdin.setRawMode(false);
            stdin.pause();
            process.stdout.write("\nCancelled. Nothing was changed.\n");
            process.exit(1);
            break;
          case "":
          case "\b":
            value = value.slice(0, -1);
            break;
          default:
            // Ignore other control characters; keep anything printable.
            if (char >= " ") value += char;
        }
      }
    };

    stdin.on("data", onData);
  });
}

/** Replaces a KEY=value line, or appends it when the key isn't there yet. */
function upsert(contents, key, value) {
  const pattern = new RegExp(`^${key}=.*$`, "m");
  if (pattern.test(contents)) return contents.replace(pattern, `${key}=${value}`);
  return contents.replace(/\n*$/, "\n") + `${key}=${value}\n`;
}

/** Removes a KEY=... line entirely. */
function removeKey(contents, key) {
  return contents.replace(new RegExp(`^${key}=.*\\n?`, "m"), "");
}

async function main() {
  if (!existsSync(ENV_PATH)) {
    console.error("Could not find .env.local next to package.json. Run this from the project folder.");
    process.exit(1);
  }

  console.log("\nSet the admin password for signing in to /admin.\n");
  console.log("Nothing you type is shown on screen. Pick something long and unique —");
  console.log("do NOT reuse your email or bank password.\n");

  const password = await askHidden("New password: ");
  if (password.length < MIN_LENGTH) {
    console.error(`\nToo short — use at least ${MIN_LENGTH} characters. Nothing was changed.`);
    process.exit(1);
  }

  const confirm = await askHidden("Type it again: ");
  if (password !== confirm) {
    console.error("\nThose didn't match. Nothing was changed.");
    process.exit(1);
  }

  // Same scrypt parameters as employee passwords (src/lib/password.ts), so both
  // accounts get identical treatment.
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  let contents = readFileSync(ENV_PATH, "utf8");
  contents = upsert(contents, "ADMIN_PASSWORD_HASH", hash);
  contents = upsert(contents, "ADMIN_PASSWORD_SALT", salt);
  // The whole point: the readable copy must not survive this.
  const hadPlaintext = /^ADMIN_PASSWORD=/m.test(contents);
  contents = removeKey(contents, "ADMIN_PASSWORD");

  writeFileSync(ENV_PATH, contents, { mode: 0o600 });
  try {
    chmodSync(ENV_PATH, 0o600); // No-op on Windows, meaningful everywhere else.
  } catch {
    // Permission model differs on Windows; not worth failing over.
  }

  console.log("\nDone.");
  console.log("  - ADMIN_PASSWORD_HASH and ADMIN_PASSWORD_SALT written to .env.local");
  if (hadPlaintext) {
    console.log("  - The old plain-text ADMIN_PASSWORD line was removed");
  }
  console.log("\nRestart the dev server, then sign in with your new password.");
  console.log("If you ever forget it, run this again to set a new one.\n");
}

main().catch((error) => {
  console.error("Something went wrong:", error.message);
  process.exit(1);
});
